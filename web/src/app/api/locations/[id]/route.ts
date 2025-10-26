import { placeDetails } from '@/lib/repos/googlePlaces';

// GET /api/locations/[id]
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const d = await placeDetails(params.id); // fetch place details from Google Places
    return Response.json(d); // return as JSON
  } catch (e: any) { // error handling
    return new Response(e?.message || 'error', { status: 500 }); // 500 on error
  }
}