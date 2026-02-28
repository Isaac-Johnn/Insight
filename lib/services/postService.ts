import {supabase} from '@/lib/supabase/client'

export async function createPost(
    userId: string,
    file: File,
    caption: string 
){
    // 1️⃣ Generate file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`

    // 2️⃣ Upload image to storage
    const {error: uploadError} = await supabase.storage
        .from ('post-images')
        .upload(fileName, file)

    if(uploadError) throw uploadError 


    // 3️⃣ Get public URL
    const {data} = supabase.storage 
        .from('post-images')
        .getPublicUrl(fileName) 

    const imageUrl = data.publicUrl

    // 4️⃣ Insert into posts table
    const {error: insertError} = await supabase.from('posts').insert({
        user_id: userId,
        image_url: imageUrl,
        caption: caption,  
    })

    if (insertError) throw insertError

    return true
}

/*
It:
Uploads file
Gets public URL
Saves post in DB
Uses RLS to verify user owns it
 */