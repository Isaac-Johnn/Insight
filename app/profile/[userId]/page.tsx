'use client'

import {useEffect, useState} from 'react'
import {supabase} from '@/lib/supabase/client'
import PostCard from '@/components/PostCard'
import {toggleFollow} from '@/lib/services/followService'
import {useParams} from 'next/navigation'

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

export default function ProfilePage(){
    const params = useParams()
    const userId = params.userId as string

    const [posts, setPosts] = useState<Post[]>([])
    const [viewerId, setViewerId] = useState<string | null>(null)
    const [username, setUsername] = useState('')
    const [isFollowing, setIsFollowing] = useState(false)
    const [followerCount, setFollowerCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    // const [profileUserId, setProfileUserId] = useState<string | null>(null)

    const fetchProfile = async (id: string) => {
        const {data: userData} = await supabase.auth.getUser()
        const viewer = userData.user
        if(!viewer) return

        setViewerId(viewer.id)

        const {data} = await supabase.rpc('get_user_posts', {
            viewer_id: viewer.id,
            profile_user_id: id,
        })

        if (data){
            setPosts(data)
            if (data.length > 0){
                setUsername(data[0].username)
                setIsFollowing(data[0].is_following) 
            }
        }

        //follower count
        const {count: followers} = await supabase
            .from('followers')
            .select('*', {count: 'exact', head:true})
            .eq('following_id', userId)

        setFollowerCount(followers || 0)

        //following count
        const {count: following} = await supabase
            .from('followers')
            .select('*', {count: 'exact', head:true})
            .eq('follower_id', userId)

        setFollowingCount(following || 0)
    }

    useEffect(() => {
        if (userId) {
            fetchProfile(userId)
        }
    }, [userId])

    return (
        <div className='max-w-xl mx-auto p-10 space-y-6'>
            <div className='flex gap-4 mb-4'>
                <a href="/feed" className='text-blue-700'>Home</a>
                <a href="/explore" className='text-blue-700'>Explore</a>
                <a href="/create" className='text-blue-700'>Create</a>
            </div>
            <h1 className='text-2xl font-bold'>{username}</h1>

            <div className='flex gap-6 text-sm text-gray-600'>
                <span>{posts.length} posts</span>
                <span>{followerCount} followers</span>
                <span>{followingCount} following</span>
            </div>

            <h3 className='text-lg font-semibold'>Your Posts...</h3>

            {viewerId && viewerId !== userId &&(
                <button
                    className={`px-4 py-1 rounded ${
                        isFollowing? 'bg-red-500 text-white':'bg-blue-500 text-white'
                    }`}
                    
                    onClick={async () => {
                        if (!viewerId) return
                        await toggleFollow(viewerId, userId)
                        await fetchProfile(userId)
                    }}
                >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
            )}

            <div className='space-y-6'>
                {posts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={viewerId}
                        refreshFeed={() => fetchProfile(userId)}
                        showFollowButton={false} // Don't show follow button on profile posts
                    />
                ))}
            </div>
        </div>
    )
}