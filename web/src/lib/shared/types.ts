
// The three categories in the left sidebar.
export type Category = 'lodging' | 'dining' | 'attractions';

// Minimal info needed to render a card in the grid.
export type PlaceRow = {
  userRatingCount: number | undefined;
  rating: number | undefined;
  id: string;
  name: string;
  address: string;
  mapUrl: string;
  primaryType?: string;
  lat?: number;
  lng?: number;
  photoName?: string;
};

// City/location picked either via autocomplete or geolocation
export type CityPick = {
  name: string;
  lat: number;
  lng: number;
};

// Extra fields used in the details modal
export type PlaceDetails = {
  id: string;
  name: string;
  address: string;
  mapUrl: string;
  websiteUri?: string;
  phone?: string;
  rating?: number;
  userRatingCount?: number;
  openingHours?: string[] | null;
  description?: string;
  photos?: string[];
};