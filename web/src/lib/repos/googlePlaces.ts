import 'server-only';
import type { PlaceRow, PlaceDetails } from '@/lib/shared/types';

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
const key = () => process.env.GOOGLE_MAPS_SERVER_KEY!;


export async function textSearchPage(opts: {
  textQuery: string;
  pageSize?: number;
  pageToken?: string | null;
  lat?: number;
  lng?: number;
}): Promise<{ rows: PlaceRow[]; nextPageToken: string | null }> {
  const { textQuery, pageSize = 20, pageToken = null, lat, lng } = opts;

  const body: any = {
    textQuery,
    pageSize: Math.min(pageSize, 20),
  };
  if (pageToken) body.pageToken = pageToken;
  if (typeof lat === 'number' && typeof lng === 'number') {
    body.locationBias = { circle: { center: { latitude: lat, longitude: lng }, radius: 6000 } };
  }

  const r = await fetch(TEXT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key(),
      'X-Goog-FieldMask': LIST_FIELDS
    },
    body: JSON.stringify(body),
    cache: 'no-store'
  });
  if (!r.ok) throw new Error(await r.text());
  const data = await r.json();

  const rows: PlaceRow[] = (data.places || []).map((p: any) => ({
    id: p.id,
    name: p.displayName?.text,
    address: p.formattedAddress,
    mapUrl: p.googleMapsUri,
    primaryType: p.primaryType,
    lat: p.location?.latitude,
    lng: p.location?.longitude,
    photoName: p.photos?.[0]?.name
  }));
  return { rows, nextPageToken: data.nextPageToken ?? null };
}

export async function placeDetails(id: string): Promise<PlaceDetails> {
  const url = `${BASE_PLACE}${encodeURIComponent(id)}?fields=${encodeURIComponent(DETAIL_FIELDS)}`;
  const r = await fetch(url, { headers: { 'X-Goog-Api-Key': key() }, cache: 'no-store' });
  if (!r.ok) throw new Error(await r.text());
  const p = await r.json();
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
      p.regularOpeningHours?.weekdayDescriptions ?? null,
    photos: (p.photos || []).map((ph: any) => ph.name)
  };
}
