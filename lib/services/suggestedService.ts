import {supabase} from '@/lib/supabase/client'

export async function getSuggestedUsers(viewerId: string){
    const {data, error} = await supabase
        .rpc('get_suggested_users', {
            viewer_id: viewerId,
        })

    if(error){
        console.error(error)
        return []
    }

    return data
}