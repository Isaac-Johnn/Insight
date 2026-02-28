import {supabase} from '@/lib/supabase/client'

export async function isFollowing(
    currentUserId: string,
    targetUserId: string 
){
    const {data} = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .single() 

    return !!data 
}

export async function toggleFollow(
    currentUserId:string,
    targetUserId: string
){
    if (currentUserId === targetUserId) return false

    const following = await isFollowing(currentUserId, targetUserId)

    if(following){
        await supabase
            .from('followers')
            .delete()
            .eq('follower_id', currentUserId)
            .eq('following_id', targetUserId)

        return false
    } else {
        await supabase.from('followers').insert({
            follower_id: currentUserId,
            following_id: targetUserId,
        })

        return true
    }
}