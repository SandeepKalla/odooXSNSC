/**
 * External API Services for GlobeTrotter
 * 
 * This file contains integrations with free APIs to enhance the application
 * with real-world data for cities, activities, images, and more.
 */

// ============================================================================
// 1. REST COUNTRIES API (No API key needed!)
// ============================================================================
const REST_COUNTRIES_BASE = 'https://restcountries.com/v3.1';

export interface CountryData {
  name: { common: string; official: string };
  currencies: Record<string, { name: string; symbol: string }>;
  languages: Record<string, string>;
  timezones: string[];
  flags: { png: string; svg: string };
  capital: string[];
  population: number;
  region: string;
}

export async function getCountryData(countryName: string): Promise<CountryData | null> {
  try {
    const response = await fetch(`${REST_COUNTRIES_BASE}/name/${encodeURIComponent(countryName)}?fullText=true`);
    if (!response.ok) return null;
    
    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error('Error fetching country data:', error);
    return null;
  }
}

export async function getAllCountries(): Promise<CountryData[]> {
  try {
    const response = await fetch(`${REST_COUNTRIES_BASE}/all`);
    if (!response.ok) return [];
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching all countries:', error);
    return [];
  }
}

// ============================================================================
// 2. UNSPLASH API (Images)
// ============================================================================
const UNSPLASH_BASE = 'https://api.unsplash.com';
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export interface UnsplashPhoto {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  description: string | null;
  alt_description: string | null;
}

export async function searchCityImages(cityName: string, country?: string): Promise<UnsplashPhoto[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('Unsplash API key not configured');
    return [];
  }

  try {
    const query = country ? `${cityName} ${country}` : cityName;
    const response = await fetch(
      `${UNSPLASH_BASE}/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching Unsplash images:', error);
    return [];
  }
}

export async function getActivityImage(activityName: string, cityName?: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) return null;

  try {
    const query = cityName ? `${activityName} ${cityName}` : activityName;
    const response = await fetch(
      `${UNSPLASH_BASE}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.results?.[0]?.urls?.regular || null;
  } catch (error) {
    console.error('Error fetching activity image:', error);
    return null;
  }
}

// ============================================================================
// 3. OPENWEATHERMAP API (Weather)
// ============================================================================
const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
}

export async function getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData | null> {
  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeatherMap API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `${OPENWEATHER_BASE}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) return null;

    const data = await response.json();
    return {
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      wind_speed: data.wind.speed,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

export async function getWeatherForecast(lat: number, lon: number, days: number = 5): Promise<any[]> {
  if (!OPENWEATHER_API_KEY) return [];

  try {
    const response = await fetch(
      `${OPENWEATHER_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=${days * 8}`
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.list || [];
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return [];
  }
}

// ============================================================================
// 4. OPENTRIPMAP API (Places/Activities)
// ============================================================================
const OPENTRIPMAP_BASE = 'https://api.opentripmap.io/0.1/en';
const OPENTRIPMAP_API_KEY = process.env.OPENTRIPMAP_API_KEY;

export interface OpenTripMapPOI {
  xid: string;
  name: string;
  point: { lon: number; lat: number };
  kinds: string;
  dist?: number;
}

export interface OpenTripMapPlaceDetails {
  xid: string;
  name: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
  point: { lon: number; lat: number };
  wikipedia?: string;
  image?: string;
  wikipedia_extracts?: {
    text: string;
  };
  kinds: string;
  otm?: string;
  rate?: string;
}

export async function getPlacesNearby(lat: number, lon: number, radius: number = 5000, kinds?: string): Promise<OpenTripMapPOI[]> {
  if (!OPENTRIPMAP_API_KEY) {
    console.warn('OpenTripMap API key not configured');
    return [];
  }

  try {
    const kindsParam = kinds ? `&kinds=${encodeURIComponent(kinds)}` : '';
    const response = await fetch(
      `${OPENTRIPMAP_BASE}/places/radius?radius=${radius}&lon=${lon}&lat=${lat}${kindsParam}&apikey=${OPENTRIPMAP_API_KEY}&limit=50`
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.features?.map((f: any) => ({
      xid: f.properties.xid,
      name: f.properties.name,
      point: f.geometry.coordinates,
      kinds: f.properties.kinds,
      dist: f.properties.dist,
    })) || [];
  } catch (error) {
    console.error('Error fetching places:', error);
    return [];
  }
}

export async function getPlaceDetails(xid: string): Promise<OpenTripMapPlaceDetails | null> {
  if (!OPENTRIPMAP_API_KEY) return null;

  try {
    const response = await fetch(
      `${OPENTRIPMAP_BASE}/places/xid/${xid}?apikey=${OPENTRIPMAP_API_KEY}`
    );

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}

// Common POI kinds for filtering:
// - interesting_places (all)
// - cultural (museums, galleries, etc.)
// - entertainment (theaters, cinemas, etc.)
// - food (restaurants, cafes)
// - accomodations (hotels, hostels)
// - natural (parks, beaches)
// - sport (stadiums, sports facilities)
// - shops (markets, malls)

// ============================================================================
// 5. EXCHANGE RATE API (Currency)
// ============================================================================
const EXCHANGERATE_BASE = 'https://v6.exchangerate-api.com/v6';
const EXCHANGERATE_API_KEY = process.env.EXCHANGERATE_API_KEY;

export interface ExchangeRates {
  base_code: string;
  conversion_rates: Record<string, number>;
}

export async function getExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRates | null> {
  if (!EXCHANGERATE_API_KEY) {
    console.warn('ExchangeRate API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `${EXCHANGERATE_BASE}/${EXCHANGERATE_API_KEY}/latest/${baseCurrency}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    return {
      base_code: data.base_code,
      conversion_rates: data.conversion_rates,
    };
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return null;
  }
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string, rates: ExchangeRates): number {
  if (fromCurrency === toCurrency) return amount;
  if (fromCurrency === rates.base_code) {
    return amount * (rates.conversion_rates[toCurrency] || 1);
  }
  if (toCurrency === rates.base_code) {
    return amount / (rates.conversion_rates[fromCurrency] || 1);
  }
  // Convert to base, then to target
  const baseAmount = amount / (rates.conversion_rates[fromCurrency] || 1);
  return baseAmount * (rates.conversion_rates[toCurrency] || 1);
}

// ============================================================================
// 6. NOMINATIM (OpenStreetMap Geocoding)
// ============================================================================
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

export interface GeocodeResult {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    country?: string;
    state?: string;
  };
}

export async function geocodeCity(cityName: string, country?: string): Promise<GeocodeResult | null> {
  try {
    const query = country ? `${cityName}, ${country}` : cityName;
    const response = await fetch(
      `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'GlobeTrotter/1.0', // Required by Nominatim
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.length === 0) return null;

    return {
      lat: data[0].lat,
      lon: data[0].lon,
      display_name: data[0].display_name,
      address: data[0].address || {},
    };
  } catch (error) {
    console.error('Error geocoding city:', error);
    return null;
  }
}

// ============================================================================
// Helper: Cache wrapper to reduce API calls
// ============================================================================
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
}

export function setCached(key: string, data: any, ttl: number = CACHE_TTL): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl,
  });
}

