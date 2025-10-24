import { createSupabaseClient } from '@/lib/shared/supabaseClient';

export async function getLocations(itineraryid: string) {
    const supabase = createSupabaseClient();

    const {
        data, error
    } = await supabase.from('locations').select().eq('itineraryid', itineraryid)

    if (error) {
        throw error;
    }

    return data;
}