'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import PostCard from '@/components/PostCard'
import SuggestedUsers from '@/components/SuggestedUsers'

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

export default function FeedPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    const observer = useRef<IntersectionObserver | null>(null)
    const PAGE_SIZE = 10

    // Unified fetch function for both initial load and pagination
    const fetchFeed = useCallback(async (pageNum: number) => {
        // Only show full-page loading for the first fetch
        if (pageNum === 0) setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserId(user.id)

        const { data, error } = await supabase.rpc('get_ranked_feed', {
            user_id_param: user.id,
            limit_val: PAGE_SIZE,
            offset_val: pageNum * PAGE_SIZE
        })

        if (!error && data) {
            // If it's the first page, replace. If it's a new page, append.
            setPosts(prev => pageNum === 0 ? data : [...prev, ...data])
            // If we received fewer posts than requested, there's no more data
            setHasMore(data.length === PAGE_SIZE)
        }

        setLoading(false)
    }, [])

    // Intersection Observer: Triggered when the last post enters the viewport
    const lastPostRef = useCallback((node: HTMLDivElement) => {
        if (loading) return
        if (observer.current) observer.current.disconnect()

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1)
            }
        })

        if (node) observer.current.observe(node)
    }, [loading, hasMore])

    // Load initial feed
    useEffect(() => {
        fetchFeed(0)
    }, [fetchFeed])

    // Fetch more when page increments
    useEffect(() => {
        if (page > 0) {
            fetchFeed(page)
        }
    }, [page, fetchFeed])

    if (loading && posts.length === 0) return <div className="p-10">Loading feed...</div>

    return (
        <div className="max-w-xl mx-auto p-10 space-y-6">
            

            {/* Existing Suggested Users Feature */}
            <div className='max-w-4xl mx-auto'>
                {userId && <SuggestedUsers viewerId={userId} />}
            </div>

            {posts.length === 0 && !loading && <p>No posts yet, boi.</p>}

            {/* Feed Rendering with Infinite Scroll Ref */}
            <div className="space-y-6">
                {posts.map((post, index) => {
                    const isLastElement = posts.length === index + 1
                    
                    return (
                        <div 
                            key={post.id} 
                            ref={isLastElement ? lastPostRef : null}
                        >
                            <PostCard
                                post={post}
                                currentUserId={userId}
                                // Re-fetches current state if a like/comment happens
                                refreshFeed={() => fetchFeed(0)} 
                                showFollowButton={false}
                            />
                        </div>
                    )
                })}
            </div>

            {/* Loading Indicator for the bottom of the feed */}
            {loading && posts.length > 0 && (
                <p className="text-center py-4 text-gray-500">Loading more content...</p>
            )}
            
            {!hasMore && posts.length > 0 && (
                <p className="text-center py-4 text-gray-400 text-sm">You have reached the end of the feed.</p>
            )}
        </div>
    )
}