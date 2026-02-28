'use client'

import { useEffect, useState} from 'react'
import {supabase} from '@/lib/supabase/client'
import PostCard from '@/components/PostCard'

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

export default function ExplorePage(){
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    const fetchExplore = async () =>{
            const {data: userData} = await supabase.auth.getUser()
            const user = userData.user
            if (!user) return

            setUserId(user.id)

            const {data, error} = await supabase.rpc('get_explore_feed', {
                user_id_param: user.id,
            })
        
            if(!error){
                setPosts(data || [])
            }

            setLoading(false)
        }

    useEffect(() => {
        fetchExplore()
    }, [])

    if (loading) return <div className = "p-10">Loading explore...</div>

    return(
        <div className = "max-w-xl mx-auto p-10 space-y-6">
            <div className='flex gap-4 mb-4'>
                <a href="/feed" className='text-blue-700'>Home</a>
                <a href="/create" className='text-blue-700'>Create</a>
            </div>

            <h1 className='text-2xl font-bold'>Explore</h1>

            {posts.map((post) => (
                <PostCard
                    key = {post.id}
                    post = {post}
                    currentUserId = {userId}
                    refreshFeed={fetchExplore}
                    showFollowButton={true} // Show follow button on explore page
                />
            ))}
        </div>
    )
}