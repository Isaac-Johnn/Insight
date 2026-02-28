'use client'

import {useEffect, useState} from 'react'
import {supabase} from '@/lib/supabase/client'
import {toggleLike} from '@/lib/services/likeService'
import {addComment} from '@/lib/services/commentService'
import Comments from '@/components/Comments'
import {toggleFollow} from '@/lib/services/followService'
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

export default function FeedPage(){
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0) // simple way to trigger re-fetch
    const [viewerId, setViewerId] = useState<string | null>(null)

    const fetchFeed = async () => {
        const {data: userData} = await supabase.auth.getUser()
        const user = userData.user
        if (!user) return

        setUserId(user.id)
        setRefreshKey(prev => prev+1) // trigger re-fetch after getting user

        const {data, error} = await supabase.rpc('get_ranked_feed', {
            user_id_param: user.id,
        })

        console.log(data)   // Debug: log the feed data

        if (!error) {
            setPosts(data || [])
        }

        setLoading(false)
    }

    useEffect(() => {
        async function getUser() {
            const {data} = await supabase.auth.getUser()
            if (data.user) {
                setViewerId(data.user.id)
            }
        }
        getUser()
        fetchFeed()
    }, [])

    if (loading) return <div className ="p-10">Loading feed...</div>

    return (

        <div className="max-w-xl mx-auto p-10 space-y-6">
            <div className='flex gap-4 mb-4'>
                <a href="/feed" className='text-blue-700'>Home</a>
                <a href="/explore" className='text-blue-700'>Explore</a>
                <a href="/create" className='text-blue-700'>Create</a>
                <a href={`/profile/${userId}`} className='text-blue-700'>Profile</a>
            </div>

            <h1 className='text-2xl font-bold'>Feed</h1>

            {posts.length === 0 && <p>No posts yet, boi.</p>}

            <div className='max-w-4xl mx-auto'>
                {viewerId && (
                    <SuggestedUsers viewerId = {viewerId} />
                )}
            </div>

            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={userId}
                    refreshFeed={fetchFeed}
                    showFollowButton={false} // Hide follow button on feed, only show on explore
                />
            ))}
        </div>
    )
}