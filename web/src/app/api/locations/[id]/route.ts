import { placeDetails } from '@/lib/repos/googlePlaces';

// GET /api/locations/[id]
// Fetches detailed information about a place using its unique identifier
// from Google Places API
export async function GET(req: Request, context: any) {
  const id = context?.params?.id as string | undefined;// extract id from URL params
  if (!id) return new Response('Missing id', { status: 400 });

  // Fetch place details and handle potential errors
  try {
    const d = await placeDetails(id);   // fetch place details from Google Places
    return Response.json(d);            // return as JSON
  } catch (e: any) {
    return new Response(e?.message || 'error', { status: 500 });
  }
}