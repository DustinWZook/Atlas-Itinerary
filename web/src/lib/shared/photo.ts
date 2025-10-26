
// Generates a Google Places photo URL given a photo name and optional dimensions
export function photoUrl(name?: string, maxWidthPx = 400, maxHeightPx = 300) {
  if (!name) return '';// return empty string if no name
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!; // get API key from env
  const params = new URLSearchParams({
    key,
    maxWidthPx: String(maxWidthPx),
    maxHeightPx: String(maxHeightPx)
  }); // build query parameters
  return `https://places.googleapis.com/v1/${name}/media?${params.toString()}`; // construct and return URL
}