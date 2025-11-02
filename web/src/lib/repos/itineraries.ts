import { createSupabaseClient } from '@/lib/shared/supabaseClient';

export type ItineraryRow = {
  itineraryid: string;
  name: string;
  traveldestination: string | null;
  startdate: string | null;
  enddate: string | null;
  user_id: string;
};

export async function getItineraries(): Promise<ItineraryRow[]> {
  const supabase = createSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return [];

  const { data, error } = await supabase
    .from('itineraries')
    .select('itineraryid,name,traveldestination,startdate,enddate,user_id')
    .eq('user_id', uid)
    .order('startdate', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ItineraryRow[];
}

export type ItineraryInsert = {
  name: string;
  traveldestination: string;
  startdate: string;
  enddate: string;
};

export async function createItinerary(input: {
  name: string;
  traveldestination: string | null;
  startdate: string;
  enddate: string;
}): Promise<{ itineraryid: string }> {
  const supabase = createSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error('Not signed in.');

  const { data, error } = await supabase
    .from('itineraries')
    .insert({
      name: input.name,
      traveldestination: input.traveldestination,
      startdate: input.startdate,
      enddate: input.enddate,
      user_id: uid,
    })
    .select('itineraryid')
    .single();

  if (error) throw error;
  return { itineraryid: data!.itineraryid };
}

// Removes the itinerary row identified by the itineraryid parameter passed
export async function removeItinerary(itineraryid: string) {
    const supabase = createSupabaseClient();

    const response = await supabase
        .from('itineraries')
        .delete()
        .eq('itineraryid', itineraryid);
    
    if (response.error) {
        throw response.error;
    }
}