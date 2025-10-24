import { createSupabaseClient } from '@/lib/shared/supabaseClient';

export async function getItineraries() {
    const supabase = createSupabaseClient();

    const {
        data, error
    } = await supabase.from('itineraries').select();

    if (error) {
        throw error;
    }

    return data;
}