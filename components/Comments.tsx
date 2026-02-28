'use  client'

import {useEffect, useState} from 'react'
import {supabase} from '@/lib/supabase/client'

type Comment = {
    id: string
    content: string
}

export default function Comments({
    postId,
    refreshKey,
}: {
    postId: string
    refreshKey: number
}){
    const [comments, setComments] = useState<Comment[]>([])

    useEffect(() => {
        async function fetchComments() {
            const {data} = await supabase 
                .from('comments')
                .select(`
                    id,
                    content,
                    profiles ( username )
                    `)
                .eq('post_id', postId)
                .order('created_at', {ascending: false})

            setComments( data || [])
        }

        fetchComments()
    }, [postId, refreshKey])

    return (
        <div>
            {comments.map((comment) => (
                <p key = {comment.id} className = "text-sm text-gray-700">
                    {comment.content}
                </p>
            ))}
        </div>
    )
}