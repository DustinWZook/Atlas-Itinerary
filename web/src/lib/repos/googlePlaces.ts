import 'server-only';
import type { PlaceRow, PlaceDetails } from '@/lib/shared/types';

// Google Places API endpoints and field masks
// for text search and place details

const TEXT_URL = 'https://places.googleapis.com/v1/places:searchText';
const BASE_PLACE = 'https://places.googleapis.com/v1/places/';
const LIST_FIELDS = [
  'places.id','places.displayName','places.formattedAddress',
  'places.googleMapsUri','places.primaryType','places.location','places.photos.name',
  'nextPageToken'
].join(',');
const DETAIL_FIELDS = [
  'id','displayName','formattedAddress','googleMapsUri','websiteUri',
  'nationalPhoneNumber','rating','userRatingCount',
  'currentOpeningHours.weekdayDescriptions','regularOpeningHours.weekdayDescriptions',
  'editorialSummary','photos.name'
].join(',');
const key = () => process.env.GOOGLE_MAPS_SERVER_KEY!; // get API key from env

// Fetch a page of places using text search
export async function textSearchPage(opts: {// options object
  lat: number; lng: number; // required latitude and longitude
  includedType?: string; strictTypeFiltering?: boolean; // optional type filtering
  textQuery?: string; radius?: number; pageSize?: number; pageToken?: string | null; // pagination
}): Promise<{ rows: PlaceRow[]; nextPageToken: string | null }> { // return type
  const {
    lat, lng, includedType, strictTypeFiltering = false, // defaults
    textQuery, radius = 6000, pageSize = 20, pageToken = null // defaults
  } = opts; // destructure options

  // build request body
  const body: any = { // any type for dynamic fields
    pageSize: Math.min(pageSize, 20), // max 20

    locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius } }, // location bias

  }; // build request body
  if (includedType) { body.includedType = includedType; body.strictTypeFiltering = strictTypeFiltering; } // type filtering
  if (textQuery) body.textQuery = textQuery; // text query if provided
  if (pageToken) body.pageToken = pageToken; // page token if provided

    // make the POST request to Google Places API
  const r = await fetch(TEXT_URL, {
    method: 'POST',// POST method
    headers: { // headers
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key(),
      'X-Goog-FieldMask': LIST_FIELDS
    },
    body: JSON.stringify(body), // request body as JSON
    cache: 'no-store' // disable caching
  }); // fetch call
  if (!r.ok) throw new Error(await r.text());// error handling
  const data = await r.json();// parse JSON response

  // map response places to PlaceRow format
  const rows: PlaceRow[] = (data.places || []).map((p: any) => ({ // any type for place
    id: p.id,
    name: p.displayName?.text,
    address: p.formattedAddress,
    mapUrl: p.googleMapsUri,
    primaryType: p.primaryType,
    lat: p.location?.latitude,
    lng: p.location?.longitude,
    photoName: p.photos?.[0]?.name
  })); // mapping
  return { rows, nextPageToken: data.nextPageToken ?? null }; // return rows and next page token
}

export async function placeDetails(id: string): Promise<PlaceDetails> { // fetch place details by ID
  const url = `${BASE_PLACE}${encodeURIComponent(id)}?fields=${encodeURIComponent(DETAIL_FIELDS)}`; // build URL
  const r = await fetch(url, { headers: { 'X-Goog-Api-Key': key() }, cache: 'no-store' });// fetch call
  if (!r.ok) throw new Error(await r.text()); // error handling
  const p = await r.json(); // parse JSON response

  // map response to PlaceDetails format
  return {
    id: p.id,
    name: p.displayName?.text,
    address: p.formattedAddress,
    mapUrl: p.googleMapsUri,
    websiteUri: p.websiteUri,
    phone: p.nationalPhoneNumber,
    rating: p.rating,
    userRatingCount: p.userRatingCount,
    description: p.editorialSummary?.overview,
    openingHours:
      p.currentOpeningHours?.weekdayDescriptions ??
      p.regularOpeningHours?.weekdayDescriptions ??
      null,
    photos: (p.photos || []).map((ph: any) => ph.name) // map photo names
  };// return PlaceDetails
}
