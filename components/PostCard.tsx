'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react'
import { toggleLike } from '@/lib/services/likeService'
import { addComment } from '@/lib/services/commentService'
import { toggleFollow } from '@/lib/services/followService'
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
    const [liked, setLiked] = useState(false)
    const [localScore, setLocalScore] = useState(post.score)

    // Preserve your existing sync logic
    useEffect(() => { setLocalScore(post.score) }, [post.score])
    useEffect(() => { setFollowing(post.is_following) }, [post.is_following])

    // Preserve your Real-Time Comments & Score logic
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

        const commentChannel = supabase
            .channel(`comments-${post.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id = eq.${post.id}` }, 
                (payload) => setComments(prev => [payload.new as CommentItem, ...prev]))
            .subscribe()

        const scoreChannel = supabase
            .channel(`post-${post.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts', filter: `id = eq.${post.id}` }, 
                (payload) => setLocalScore(payload.new.engagement_score))
            .subscribe()

        return () => {
            supabase.removeChannel(commentChannel)
            supabase.removeChannel(scoreChannel)
        }
    }, [post.id])

    const handleAddComment = async () => {
        if (!currentUserId || !commentText.trim() || loadingComment) return
        const text = commentText.trim()
        setCommentText('')
        setLoadingComment(true)
        const tempComment = { id: crypto.randomUUID(), content: text }
        setComments(prev => [tempComment, ...prev])
        try { await addComment(post.id, currentUserId, text) } 
        catch (err) { setComments(prev => prev.filter(c => c.id !== tempComment.id)) } 
        finally { setLoadingComment(false) }
    }

    const handleToggleFollow = async () => {
        if (!currentUserId) return
        const newState = !following
        setFollowing(newState)
        try { await toggleFollow(currentUserId, post.user_id); await refreshFeed() } 
        catch (err) { setFollowing(!newState) }
    }

    const handleLike = async () => {
        if (!currentUserId) return
        setLiked(!liked)
        try { await toggleLike(post.id, currentUserId) } 
        catch (err) { setLiked(liked) }
    }

    return (
        <div className="w-full border-b border-neutral-800 pb-4">
            {/* Header: User Info */}
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700">
                        <img src={`https://i.pravatar.cc/150?u=${post.username}`} alt="avatar" />
                    </div>
                    <a href={`/profile/${post.user_id}`} className="text-sm font-semibold hover:text-neutral-400">
                        {currentUserId === post.user_id ? 'you' : post.username}
                    </a>
                </div>
                
                {showFollowButton && currentUserId && post.user_id !== currentUserId ? (
                    <button 
                        onClick={handleToggleFollow}
                        className={`text-sm font-semibold transition ${following ? 'text-white' : 'text-blue-500 hover:text-white'}`}
                    >
                        {following ? 'Following' : 'Follow'}
                    </button>
                ) : (
                    <MoreHorizontal size={20} className="text-neutral-500" />
                )}
            </div>

            {/* Content: Edge-to-Edge Image */}
            <div className="aspect-square w-full bg-neutral-900 overflow-hidden">
                <img src={post.image_url} alt="post content" className="w-full h-full object-cover" />
            </div>

            {/* Actions: Interaction Bar */}
            <div className="px-3 pt-3">
                <div className="flex items-center gap-4 mb-2">
                    <Heart 
                        size={28} 
                        onClick={handleLike}
                        className={`cursor-pointer transition ${liked ? 'fill-red-500 text-red-500 scale-110' : 'hover:text-neutral-400'}`}
                    />
                    <MessageCircle size={28} className="cursor-pointer hover:text-neutral-400" />
                    <Send size={28} className="cursor-pointer hover:text-neutral-400" />
                    <Bookmark size={28} className="ml-auto cursor-pointer hover:text-neutral-400" />
                </div>

                {/* Engagement Info */}
                <p className="text-sm font-bold mb-1">
                    {localScore ? Math.floor(localScore * 10) : 0} likes
                </p>
                <div className="text-sm">
                    <span className="font-bold mr-2">{post.username}</span>
                    {post.caption}
                </div>

                {/* Comment Section */}
                <div className="mt-2 space-y-1">
                    {comments.slice(0, 2).map((comment) => (
                        <p key={comment.id} className="text-sm text-neutral-400">
                            {comment.content}
                        </p>
                    ))}
                    {comments.length > 2 && (
                        <button className="text-xs text-neutral-500">View all {comments.length} comments</button>
                    )}
                </div>

                {/* Input Field (Invisible border, cleaner look) */}
                {currentUserId && (
                    <div className="mt-3 flex items-center border-t border-neutral-900 pt-2">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            placeholder="Add a comment..."
                            className="bg-transparent text-sm w-full outline-none py-1"
                            disabled={loadingComment}
                        />
                        {commentText.trim() && (
                            <button 
                                onClick={handleAddComment}
                                className="text-blue-500 text-sm font-semibold ml-2"
                            >
                                Post
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}