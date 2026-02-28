'use client'

import {useEffect, useState} from 'react'
import {getSuggestedUsers} from '@/lib/services/suggestedService'
import {toggleFollow} from '@/lib/services/followService'

type User = {
    id: string
    username: string
    avatar_url: string 
}

export default function SuggestedUsers({viewerId}: {viewerId: string}){
    const [users, setUsers] = useState<User[]>([])

    useEffect(() => {
        async function fetchSuggestions() {
            const data = await getSuggestedUsers(viewerId)
            setUsers(data || [])
        }
        fetchSuggestions()
    }, [viewerId])

    const handleFollow = async (targetId: string) => {
        await toggleFollow(viewerId, targetId)
        setUsers(prev => prev.filter(u => u.id !== targetId))
    }

    return(
        <div className='p-4 border rounded space-y-4 bg-purple-900'>
            <h2 className='font-semibold'>SUGGESTED FOR YOU...</h2>

            {users.map(user => (
                <div key = {user.id} className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                        <img 
                            src = {user.avatar_url || '/avatar.png'}
                            className='w-8 h-8 rounded_full'
                        />
                        <span>{user.username}</span>
                    </div>

                    <button 
                        onClick = {() => handleFollow(user.id)}
                        className='text-blue-500 text-sm'
                    >
                        Follow
                    </button>
                </div>
            ))}
        </div>
    )
}