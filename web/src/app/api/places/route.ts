
import { NextRequest } from 'next/server';
import { textSearchPage } from '@/lib/repos/googlePlaces';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const city: string | undefined = body.city;
  const lat: number | undefined = body.lat;
  const lng: number | undefined = body.lng;
  const category: 'lodging'|'dining'|'attractions' = body.category;
  const pageToken: string | undefined = body.pageToken;
  const pageSize: number = body.pageSize ?? 20;

  if (!category) {
    return new Response('Missing category', { status: 400 });
  }
  if (!city && (typeof lat !== 'number' || typeof lng !== 'number')) {
    return new Response('Provide either city or lat/lng', { status: 400 });
  }

  // Build a simple text query using the category
  let q = '';
  if (category === 'lodging') q = city ? `hotels in ${city}` : 'hotels';
  else if (category === 'dining') q = city ? `restaurants in ${city}` : 'restaurants';
  else q = city ? `tourist attractions in ${city}` : 'tourist attractions';

  // Pass optional lat/lng to enable proximity bias (works when user allowed geolocation)
  const data = await textSearchPage({
    textQuery: q,
    pageSize,
    pageToken,
    lat,
    lng, 
  });

  return Response.json(data);
}

// GET /api/places
export async function GET() {
  return new Response('POST { city OR lat/lng, category, pageToken? }', { status: 200 });
}
