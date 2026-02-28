import {supabase} from '@/lib/supabase/client'

export async function toggleLike(postId: string, userId: string){

    console.log('Toggle LIKE called!!!')

    // 1️⃣ Check if user already liked the post
    const {data: existingLike, error: selectError} = await supabase 
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle()

    if (selectError) {
        console.error("SELECT ERROR:", selectError)
        throw selectError
    }

    if (existingLike){
    const { error: deleteError } = await supabase 
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)

    if (deleteError) {
        console.error("DELETE ERROR:", deleteError)
        throw deleteError
    }

        console.log("UNLIKED")
    } else {
        const { error: insertError } = await supabase 
            .from('likes')
            .insert({
                post_id: postId,
                user_id: userId,
            })

        if (insertError) {
            console.error("INSERT ERROR:", insertError)
            throw insertError
        }

        console.log("LIKED")
    }
    

    // 4️⃣ recalculate engagement score
    const {data: likes} = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)


    // Recalculate counts
    const {data: comments} = await supabase
        .from('comments')
        .select('user_id')
        .eq('post_id', postId)


    const likeCount = likes?.length || 0
    const commentCount = comments?. length || 0


    const  newScore = likeCount*1 + commentCount*2

    // 5️⃣ Update engagement score
    await supabase
        .from('posts')
        .update({engagement_score: newScore})
        .eq('id', postId)

    
    // 7️⃣ Update Interaction score
    const {data:post} = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single()

    if(post && post.user_id !== userId){
        const targetUserId = post.user_id

        const {data:existingInteraction} = await supabase
            .from('interactions')
            .select('*')
            .eq('user_id', userId)
            .eq('target_user_id', targetUserId)
            .single()

        if (existingInteraction){
            await supabase
                .from('interactions')
                .update({
                    interaction_score: existingInteraction.interaction_score + 1,
                })
                .eq('user_id', userId)
                .eq('target_user_id', targetUserId)
        } else{
            await supabase.from('interactions').insert({
                user_id: userId,
                target_user_id: targetUserId,
                interaction_score: 1,
            })
        }
    }

    return true
}