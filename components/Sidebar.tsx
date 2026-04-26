'use client'

import { useEffect, useState } from 'react'
import { Home, Compass, PlusSquare, User } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function Sidebar() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function getUserId() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUserId()
  }, [])

  return (
    <div className="flex flex-col h-full gap-8">
      <h1 className="text-2xl font-bold italic px-2 text-white">Insight</h1>
      <div className="flex flex-col gap-2">
        <Link href="/feed" className="flex items-center gap-4 p-3 hover:bg-neutral-900 rounded-lg text-white">
          <Home /> <span>Home</span>
        </Link>
        <Link href="/explore" className="flex items-center gap-4 p-3 hover:bg-neutral-900 rounded-lg text-white">
          <Compass /> <span>Explore</span>
        </Link>
        <Link href="/create" className="flex items-center gap-4 p-3 hover:bg-neutral-900 rounded-lg text-white">
          <PlusSquare /> <span>Create</span>
        </Link>
        
        {/* Only show profile link if userId is loaded to prevent 404s */}
        {userId && (
          <Link href={`/profile/${userId}`} className="flex items-center gap-4 p-3 hover:bg-neutral-900 rounded-lg text-white">
            <User /> <span>Profile</span>
          </Link>
        )}
      </div>
    </div>
  )
}