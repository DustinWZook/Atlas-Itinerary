import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Type definition for a location row in the database
export type LocationRow = {
  locationid?: string;
  itineraryid: string;
  placeid: string;
  startdate: string | null;
  enddate: string | null;
  starttime: string | null;
  endtime: string | null;
};

// List all saved places for an itinerary
export async function getLocations(itineraryid: string): Promise<LocationRow[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase // build the sql query
    .from('locations')
    .select('*')
    .eq('itineraryid', itineraryid)
    .order('startdate', { ascending: true }); // ordering by date
  if (error) throw error;// throw any errors
  return (data ?? []) as LocationRow[]; // return data or empty array
}

// Add one Google place to an itinerary (stores only placeid)
export async function addItineraryLocation(
  itineraryid: string,
  placeid: string,
  opts?: { startdate?: string|null; enddate?: string|null; starttime?: string|null; endtime?: string|null }
) {
  const supabase = createSupabaseBrowserClient();
  //build and run the insert query
  const { error } = await supabase.from('locations').insert({
    itineraryid,
    placeid,
    startdate: opts?.startdate ?? null,
    enddate:   opts?.enddate   ?? null,
    starttime: opts?.starttime ?? null,
    endtime:   opts?.endtime   ?? null,
  }); // insert query
  if (error) throw error; //throw any errors
}

// Remove a saved place from an itinerary
export async function removeItineraryLocation(locationid: string) {
  const supabase = createSupabaseBrowserClient();
  // delete location row where locationid column = passed locationid parameter
  const { error } = await supabase.from('locations').delete().eq('locationid', locationid); // delete query
  if (error) throw error; // throw any errors
}
