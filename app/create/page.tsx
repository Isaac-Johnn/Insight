'use client'

import {useState, useEffect} from 'react'
import {supabase} from '@/lib/supabase/client'
import {createPost} from '@/lib/services/postService'

export default function CreatePostPage(){
    const [file, setFile] = useState<File | null>(null)
    const [caption, setCaption] = useState('')
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        async function getUser(){
            const {data} = await supabase.auth.getUser()
            setUserId(data.user?.id ?? null)
        }
        getUser()
    }, [])

    const handleSubmit = async () => {
        if (!file || !userId) return alert('Missing file or user')

        try{
            await createPost(userId, file, caption)
            alert('Post created !!!')
        } catch (error: any){
            alert (error.message)
        }
    }

    return (
        <div className="flex flex-col gap-4 p-10 max-w-md mx-auto">
            <h1 className = "text-5xl font-bold">Create Post XD</h1>

            <input
                className='border p-2'
                type = "file"
                accept = "image/*"
                onChange = {(e) => setFile(e.target.files?.[0] || null)}
            />

            <textarea
                className = "border p-2"
                placeholder = "Write a caption ....."
                onChange = {(e) => setCaption(e.target.value)}
            />

            <button
                className = "bg-black text-white p-2 border rounded"
                onClick = {
                    async () => {
                        await handleSubmit()
                        window.location.href = '/feed'
                    }
                }
            >
                Post XD
            </button>
        </div>
    )
}