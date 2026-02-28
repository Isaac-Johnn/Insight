'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp, signIn } from '@/lib/services/authService'

export default function LoginPage() {
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSignup = async () => {
        try {
            await signUp(email, password)
            alert('Signup successful!!!')
        } catch (error: any) {
            alert(error.message)
        }
    }

    const handleLogin = async () => {
        try {
            await signIn(email, password)
            alert('login successful!!!')
            router.push('/feed') // 👈 redirect here
        } catch (error: any) {
            alert(error.message)
        }
    }

    return (
        <div className="flex flex-col gap-4 p-10 max-w-md mx-auto">
            <h1 className="text-2xl font-bold">Auth Test XD</h1>

            <input
                className="border p-2"
                placeholder="Email XD"
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                className="border p-2"
                placeholder="Password XD"
                onChange={(e) => setPassword(e.target.value)}
            />

            <button className="bg-black text-white bold p-2" onClick={handleSignup}>
                Sign Up
            </button>

            <button className="bg-gray-800 text-white bold p-2" onClick={handleLogin}>
                Login
            </button>
        </div>
    )
}

/*
This file:
Shows input fields
Handles button clicks
Calls signUp() or signIn()
Displays alerts

It does NOT:
Directly talk to database
Know how Supabase works internally
*/