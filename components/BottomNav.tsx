'use client'

import { useEffect, useState } from 'react'
import { Home, Compass, PlusSquare, User } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function BottomNav() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function getUserId() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUserId()
  }, [])

  return (
    <>
      <Link href="/feed" className="text-white"><Home size={26} /></Link>
      <Link href="/explore" className="text-white"><Compass size={26} /></Link>
      <Link href="/create" className="text-white"><PlusSquare size={26} /></Link>
      {userId && (
        <Link href={`/profile/${userId}`} className="text-white"><User size={26} /></Link>
      )}
    </>
  )
}