import { NextRequest } from 'next/server';
import { textSearchPage } from '@/lib/repos/googlePlaces';

// POST /api/places
export async function POST(req: NextRequest) {
  const { lat, lng, category, pageToken, radius = 6000, pageSize = 20 } = await req.json(); // parse request body

  let includedType: string | undefined; // default undefined
  let strictTypeFiltering = false; // default false
  let textQuery: string; // will be set based on category

  // Determine search parameters based on category
  if (category === 'lodging') { 
    // Lodging category
    includedType = 'lodging';
    strictTypeFiltering = true;// enforce type filtering
    textQuery = 'hotels'; // use hotels as text query
  } else if (category === 'dining') { // Dining category
    includedType = 'restaurant';
    strictTypeFiltering = true;// enforce type filtering
    textQuery = 'restaurants';
  } else {
    textQuery = 'tourist attractions'; // simple catch-all for Attractions
  }

  // Fetch places from Google Places API
  const data = await textSearchPage({
    lat, lng, includedType, strictTypeFiltering, textQuery, radius, pageSize, pageToken
  });

  return Response.json(data);// return results as JSON
}

// GET /api/places
export async function GET() { // simple GET handler
  return new Response('POST /api/places { lat, lng, category, pageToken? }', { status:  200 });
}
