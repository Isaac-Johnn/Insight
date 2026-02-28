'use client'

import { useState, useEffect } from 'react'
import { toggleLike } from '@/lib/services/likeService'
import { addComment } from '@/lib/services/commentService'
import { toggleFollow, isFollowing } from '@/lib/services/followService'
import { supabase } from '@/lib/supabase/client'

type Post = {
    id: string
    user_id: string
    username: string
    image_url: string
    caption: string
    created_at: string
    score: number
    is_following: boolean
}

type CommentItem = {
    id: string
    content: string
}

type Props = {
    post: Post
    currentUserId: string | null
    refreshFeed: () => Promise<void>
    showFollowButton?: boolean
}

export default function PostCard({
    post,
    currentUserId,
    refreshFeed,
    showFollowButton,
}: Props) {
    const [commentText, setCommentText] = useState('')
    const [following, setFollowing] = useState(post.is_following)
    const [comments, setComments] = useState<CommentItem[]>([])
    const [loadingComment, setLoadingComment] = useState(false)
    const [liked,setLiked] = useState(false)
    const [localScore, setLocalScore] = useState(post.score)

    // Sync Localscore when post changes
    useEffect(() => {
        setLocalScore(post.score)
    }, [post.score])

    // Sync follow state if post prop changes
    useEffect(() => {
        setFollowing(post.is_following)
    }, [post.is_following])


    // Fetch comments on mount
    useEffect(() => {
        async function fetchComments() {
            const { data } = await supabase
                .from('comments')
                .select('id, content')
                .eq('post_id', post.id)
                .order('created_at', { ascending: false })

            setComments((data ?? []) as CommentItem[])
        }

        fetchComments()

        //Real-Time Comments
        const channel = supabase
            .channel(`comments-${post.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'comments',
                    filter: `post_id = eq.${post.id}`,
                },
                (payload) => {
                    const newComment = payload.new as CommentItem
                    setComments(prev => [newComment, ...prev])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
        
    }, [post.id])

    // Real-Time Score Updates
    useEffect(() => {
        const channel = supabase
            .channel(`post-${post.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'posts',
                    filter: `id = eq.${post.id}`,
                }, 
                (payload) =>{
                    setLocalScore(payload.new.engagement_score)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [post.id])

    const handleAddComment = async () => {
        if (!currentUserId || !commentText.trim() || loadingComment) return

        const text = commentText.trim()
        setCommentText('')
        setLoadingComment(true)

        // 🔥 Optimistic UI update
        const tempComment: CommentItem = {
            id: crypto.randomUUID(),
            content: text,
        }

        setComments(prev => [tempComment, ...prev])

        try {
            await addComment(post.id, currentUserId, text)
        } catch (err) {
            console.error('Comment failed:', err)
            // rollback if needed
            setComments(prev => prev.filter(c => c.id !== tempComment.id))
        } finally {
            setLoadingComment(false)
        }
    }

    const handleToggleFollow = async () => {
        if (!currentUserId) return

        const newState = !following
        setFollowing(newState) // optimistic

        try {
            await toggleFollow(currentUserId, post.user_id)
            await refreshFeed()
        } catch (err) {
            console.error('Follow toggle failed:', err)
            setFollowing(!newState) // rollback
        }
    }

    const handleLike = async () => {
        if (!currentUserId) return

        const newState = !liked
        setLiked(newState) // 🔥 instant UI change

        try {
            await toggleLike(post.id, currentUserId)
        } catch (err) {
            console.error(err)
            setLiked(!newState) // rollback if error
        }
        console.log("LIKE BUTTON CLICKED")
    }

    return (
        <div className='border p-4 mb-5 mt-5 rounded'>
            <p className='text-xl italic mb-2 text-gray-600'>
                <a
                    href={`/profile/${post.user_id}`}
                    className="font-semibold text-white border px-2 py-1 rounded hover:underline"
                >
                    {currentUserId === post.user_id ? 'you' : post.username}
                </a>
            </p>

            {showFollowButton && currentUserId && post.user_id !== currentUserId && (
                <button
                    className={`text-sm border px-2 py-1 mb-1 rounded ${
                        following ? 'text-red-500' : 'text-blue-600'
                    }`}
                    onClick={handleToggleFollow}
                >
                    {following ? 'Unfollow' : 'Follow'}
                </button>
            )}

            <img
                src={post.image_url}
                alt="post"
                className='w-full rounded mb-2'
            />

            <p>{post.caption}</p>

            <p className='text-xs text-gray-600'>
                Score: {localScore?.toFixed(2)}
            </p>

            {/* Like Button */}
            {currentUserId && post.user_id !== currentUserId && (
                <button
                    onClick={handleLike}
                    className={`text-2xl transition transform duration-150 ${
                        liked 
                            ? 'text-pink-500 scale-110'
                            : 'text-gray-400 hover:text-pink-400'
                    }`}
                >
                    ♥
                </button>
            )}

            {/* Comment Input */}
            {currentUserId && (
                <>
                    <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        className='border mt-2 p-2 w-full'
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAddComment()
                            }
                        }}
                        disabled={loadingComment}
                    />

                    {/* Comment List */}
                    <div className="mt-2 space-y-1">
                        {comments.map((comment) => (
                            <p key={comment.id} className="text-sm text-gray-700">
                                {comment.content}
                            </p>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}