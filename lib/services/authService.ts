import {supabase} from '@/lib/supabase/client'

export async function signUp(email: string, password: string){
    const {data, error} = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) throw error
    return data
}

export async function signIn (email:string, password: string){
    const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) throw error 
    return data 
}

/* 
What This Does?
Instead of calling Supabase directly from the page:

The page calls: signUp(email, password)

The service handles:
API call
Error throwing
Returning structured data

--------------
Its job:
Talk to Supabase
Send request
Handle errors
Return response

It does NOT:
Show UI
Handle buttons
Render HTML
It only handles logic.
*/