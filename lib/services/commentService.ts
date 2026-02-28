import {supabase} from '@/lib/supabase/client'

export async function addComment(
    postId: string,
    userId: string,
    content: string 
) {
    // 1️⃣ Insert comment into DB
    const {error: insertError} = await supabase 
        .from('comments')
        .insert({
            post_id: postId,
            user_id: userId,
            content: content,
        })

    if (insertError) throw insertError

    // 2️⃣ Get total comments
    const  {data: comments} = await supabase
        .from('comments')
        .select('id')
        .eq('post_id', postId)

    const commentCount = comments?.length || 0

    // 3️⃣ Get total likes
    const {data: likes} = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)

    const likeCount = likes?.length || 0

    // 4️⃣ Calculate engagement score
    const newScore = likeCount*1 + commentCount*2

    await supabase
        .from('posts')
        .update({engagement_score: newScore})
        .eq('id', postId)


    // 5️⃣ Update interaction score
    const {data: post} = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single()

    if (post && post.user_id !== userId){       //self-interaction protection
        const targetUserId = post.user_id

        const {data: existingInteraction} = await supabase
            .from('interactions')
            .select('*')
            .eq('user_id', userId)
            .eq('target_user_id', targetUserId)
            .single()

        if (existingInteraction){
            await supabase
                .from('interactions')
                .update({
                    interaction_score: existingInteraction.interaction_score + 2})
                .eq('user_id', userId)
                .eq('target_user_id', targetUserId)
        } else {
            await supabase.from('interactions').insert({
                user_id: userId,
                target_user_id: targetUserId,
                interaction_score: 2,
            })
        }
    }
    return true
}