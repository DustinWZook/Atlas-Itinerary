import { NextRequest } from 'next/server';
import { textSearchPage } from '@/lib/repos/googlePlaces';

// POST /api/places
export async function POST(req: NextRequest) {
  try {
    const {
      lat,
      lng,
      city,
      category,
      pageToken,
      radius = 6000,
      pageSize = 20,
    } = await req.json();

    // Validate required parameters
    if ((lat == null || lng == null) && !city) {
      return new Response('Missing location: provide {lat,lng} or {city}', { status: 400 });
    }

    // Validate category
    let includedType: string | undefined;
    let strictTypeFiltering = false;
    let textQuery: string | undefined;

    // Determine search parameters based on category
    switch (category) {
      case 'lodging':
        includedType = 'lodging';
        strictTypeFiltering = true;
        textQuery = city ? `hotels in ${city}` : 'hotels';
        break;
      case 'dining':
        includedType = 'restaurant';
        strictTypeFiltering = true;
        textQuery = city ? `restaurants in ${city}` : 'restaurants';
        break;
      default:
        textQuery = city ? `tourist attractions in ${city}` : 'tourist attractions';
        break;
    }

    const data = await textSearchPage({
      // NOTE: we now pass lat/lng only if they exist; otherwise we omit them
      lat: typeof lat === 'number' ? lat : undefined,
      lng: typeof lng === 'number' ? lng : undefined,
      includedType,
      strictTypeFiltering,
      textQuery,
      radius,
      pageSize,
      pageToken: pageToken ?? null,
    });

    // Return the fetched data as JSON
    return Response.json(data);
  } catch (err: any) {
    console.error('POST /api/places failed:', err?.message || err);
    return new Response('Upstream error', { status: 500 });
  }
}

// GET /api/places
export async function GET() {
  return new Response('POST /api/places { lat,lng | city, category, pageToken? }', { status: 200 });
}
