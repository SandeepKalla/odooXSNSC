import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { api } from '../services/api';
import { getCityImageUrl } from '../utils/images';
import '../styles/global.css';

interface City {
  id: string;
  name: string;
  country: string;
  popularityScore: number;
  latitude?: number;
  longitude?: number;
}

interface CountryData {
  name: { common: string; official: string };
  currencies: Record<string, { name: string; symbol: string }>;
  flags: { png: string; svg: string };
  capital: string[];
}

const CitySearch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [countryFilter, setCountryFilter] = useState(searchParams.get('country') || '');
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [countryDataMap, setCountryDataMap] = useState<Record<string, CountryData>>({});
  const [cityImages, setCityImages] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCities();
    loadUserTrips();
  }, [searchQuery, countryFilter]);

  useEffect(() => {
    // Load country data and images for cities
    if (cities.length > 0) {
      loadCountryDataAndImages();
    }
  }, [cities]);

  useEffect(() => {
    // Extract unique countries from cities
    const countries = Array.from(new Set(cities.map(c => c.country))).sort();
    setAvailableCountries(countries);
  }, [cities]);

  const loadCities = async () => {
    setLoading(true);
    try {
      // If search query provided, try geocoding first for better results
      if (searchQuery && searchQuery.length > 2) {
        try {
          const geocodeResponse = await api.geocodeCity(searchQuery, countryFilter || undefined);
          if (geocodeResponse.data?.geocode) {
            // Use geocoded result to enhance search
            console.log('Geocoded location:', geocodeResponse.data.geocode);
          }
        } catch (error) {
          // Geocoding failed, continue with regular search
          console.log('Geocoding not available, using regular search');
        }
      }

      const response = await api.searchCities(searchQuery || undefined, countryFilter || undefined);
      if (response.data?.cities) {
        setCities(response.data.cities);
      }
    } catch (error) {
      console.error('City search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserTrips = async () => {
    try {
      const response = await api.getTrips();
      if (response.data?.trips) {
        setUserTrips(response.data.trips);
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    }
  };

  const handleAddToTrip = async (cityId: string) => {
    if (!selectedTripId) {
      alert('Please select a trip first');
      return;
    }

    try {
      // Navigate to the trip builder where user can add the city
      navigate(`/trips/builder/${selectedTripId}?cityId=${cityId}`);
    } catch (error) {
      console.error('Failed to add city to trip:', error);
      alert('Failed to add city to trip');
    }
  };

  const handleSaveDestination = async (cityId: string) => {
    try {
      await api.saveDestination(cityId);
      alert('Destination saved!');
    } catch (error) {
      console.error('Failed to save destination:', error);
      alert('Failed to save destination');
    }
  };

  const loadCountryDataAndImages = async () => {
    const uniqueCountries = Array.from(new Set(cities.map(c => c.country)));
    const newCountryData: Record<string, CountryData> = {};
    const newCityImages: Record<string, string> = {};

    // Load country data and images in parallel
    await Promise.all(
      uniqueCountries.map(async (country) => {
        try {
          const countryResponse = await api.getCountryData(country);
          if (countryResponse.data?.country) {
            newCountryData[country] = countryResponse.data.country;
          }
        } catch (error) {
          console.error(`Failed to load country data for ${country}:`, error);
        }
      })
    );

    // Load images for each city
    await Promise.all(
      cities.map(async (city) => {
        try {
          const imageResponse = await api.getCityImages(city.id);
          if (imageResponse.data?.images?.length > 0) {
            newCityImages[city.id] = imageResponse.data.images[0].urls?.regular || getCityImageUrl(city.name, city.country);
          }
        } catch (error) {
          // Fallback to placeholder
          newCityImages[city.id] = getCityImageUrl(city.name, city.country);
        }
      })
    );

    setCountryDataMap(newCountryData);
    setCityImages(newCityImages);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>City Search</h1>

        <SearchBar
          placeholder="Search cities..."
          value={searchQuery}
          onChange={setSearchQuery}
          onFilter={loadCities}
          onSortBy={loadCities}
        />

        {/* Filters */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>Filter by Country:</label>
            <select
              className="input"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              style={{ padding: '8px', minWidth: '200px' }}
            >
              <option value="">All Countries</option>
              {availableCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {userTrips.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>Add to Trip:</label>
              <select
                className="input"
                value={selectedTripId || ''}
                onChange={(e) => setSelectedTripId(e.target.value || null)}
                style={{ padding: '8px', minWidth: '200px' }}
              >
                <option value="">Select a trip...</option>
                {userTrips.map(trip => (
                  <option key={trip.id} value={trip.id}>{trip.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          <h2 style={{ marginBottom: '20px' }}>Results ({cities.length} cities)</h2>
          {loading ? (
            <div>Loading...</div>
          ) : cities.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {cities.map((city, idx) => {
                const colorClasses = ['card-blue', 'card-green', 'card-purple', 'card-orange', 'card-pink', 'card-cyan'];
                const colorClass = colorClasses[idx % colorClasses.length];
                return (
                  <div
                    key={city.id}
                    className={`container ${colorClass}`}
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      position: 'relative',
                      minHeight: '200px',
                    }}
                  >
                    <img
                      src={cityImages[city.id] || getCityImageUrl(city.name, city.country)}
                      alt={city.name}
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getCityImageUrl(city.name, city.country);
                      }}
                    />
                    <div style={{ padding: '15px', background: 'white' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <div style={{ fontWeight: 'bold' }}>{city.name}</div>
                        {countryDataMap[city.country]?.flags?.png && (
                          <img
                            src={countryDataMap[city.country].flags.png}
                            alt={city.country}
                            style={{ width: '24px', height: '16px', objectFit: 'cover', borderRadius: '2px' }}
                          />
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                        {city.country} • Popularity: {city.popularityScore}
                      </div>
                      {countryDataMap[city.country]?.currencies && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Currency: {Object.keys(countryDataMap[city.country].currencies).map(code => {
                            const currency = countryDataMap[city.country].currencies[code];
                            return `${code} (${currency.symbol})`;
                          }).join(', ')}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {selectedTripId && (
                          <button
                            className="button"
                            onClick={() => handleAddToTrip(city.id)}
                            style={{ flex: 1, padding: '5px 10px', fontSize: '12px' }}
                          >
                            Add to Trip
                          </button>
                        )}
                        <button
                          className="button"
                          onClick={() => handleSaveDestination(city.id)}
                          style={{ flex: 1, padding: '5px 10px', fontSize: '12px' }}
                        >
                          Save
                        </button>
                        <button
                          className="button"
                          onClick={() => navigate(`/search?city=${city.id}`)}
                          style={{ flex: 1, padding: '5px 10px', fontSize: '12px' }}
                        >
                          View Activities
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
              No cities found. Try adjusting your search or filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitySearch;

