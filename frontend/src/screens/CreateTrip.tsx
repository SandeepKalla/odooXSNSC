import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { api } from '../services/api';
import { getCityImageUrl } from '../utils/images';
import '../styles/global.css';

interface City {
  id: string;
  name: string;
  country: string;
}

const CreateTrip = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverPhoto: '',
    startDate: '',
    endDate: '',
    budget: '',
    cityId: '',
  });
  const [suggestedCities, setSuggestedCities] = useState<City[]>([]);
  const [cityImages, setCityImages] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadSuggestions = async () => {
      const response = await api.searchCities();
      if (response.data?.cities) {
        const cities = response.data.cities.slice(0, 6);
        setSuggestedCities(cities);
        
        // Load images for suggested cities
        const images: Record<string, string> = {};
        await Promise.all(
          cities.map(async (city: City) => {
            try {
              const imageResponse = await api.getCityImages(city.id);
              if (imageResponse.data?.images?.length > 0) {
                images[city.id] = imageResponse.data.images[0].urls?.regular || getCityImageUrl(city.name, city.country);
              } else {
                images[city.id] = getCityImageUrl(city.name, city.country);
              }
            } catch (error) {
              images[city.id] = getCityImageUrl(city.name, city.country);
            }
          })
        );
        setCityImages(images);
      }
    };
    loadSuggestions();
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-city-search]')) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      setSearchLoading(true);
      setShowSearchResults(true);
      try {
        const response = await api.searchCities(query);
        if (response.data?.cities) {
          setSearchResults(response.data.cities.slice(0, 10));
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('City search failed:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSelectCity = (city: City) => {
    setFormData({ ...formData, cityId: city.id });
    setSearchQuery(`${city.name}, ${city.country}`);
    setShowSearchResults(false);
  };

  // Update search query when cityId changes from clicking suggestions
  useEffect(() => {
    if (formData.cityId && suggestedCities.length > 0) {
      const city = suggestedCities.find(c => c.id === formData.cityId);
      if (city) {
        const cityDisplay = `${city.name}, ${city.country}`;
        if (searchQuery !== cityDisplay) {
          setSearchQuery(cityDisplay);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.cityId, suggestedCities.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.createTrip({
        name: formData.name,
        description: formData.description,
        coverPhoto: formData.coverPhoto,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: parseFloat(formData.budget) || 0,
      });

      if (response.error) {
        setError(response.error);
      } else if (response.data?.trip) {
        navigate(`/trips/builder/${response.data.trip.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>Create a new Trip</h1>

        <div className="container" style={{ padding: '30px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input
              type="text"
              name="name"
              className="input"
              placeholder="Trip Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              className="textarea"
              placeholder="Trip Description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />

            <input
              type="text"
              name="coverPhoto"
              className="input"
              placeholder="Cover Photo URL (optional)"
              value={formData.coverPhoto}
              onChange={handleChange}
            />

            <input
              type="date"
              name="startDate"
              className="input"
              placeholder="Start Date:"
              value={formData.startDate}
              onChange={handleChange}
              required
            />

            <input
              type="date"
              name="endDate"
              className="input"
              placeholder="End Date:"
              value={formData.endDate}
              onChange={handleChange}
              required
            />

            <div style={{ position: 'relative' }} data-city-search>
              <input
                type="text"
                className="input"
                placeholder="Search and select a place..."
                value={searchQuery}
                onChange={(e) => handleCitySearch(e.target.value)}
                onFocus={() => {
                  if (searchQuery.length > 1) {
                    setShowSearchResults(true);
                  }
                }}
                style={{ width: '100%' }}
              />
              {showSearchResults && (searchResults.length > 0 || searchLoading) && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: 'white',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 1000
                }}>
                  {searchLoading ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Searching...
                    </div>
                  ) : (
                    searchResults.map((city) => (
                      <div
                        key={city.id}
                        onClick={() => handleSelectCity(city)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-primary)',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>{city.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {city.country}
                        </div>
                      </div>
                    ))
                  )}
                  {!searchLoading && searchResults.length === 0 && searchQuery.length > 1 && (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No cities found
                    </div>
                  )}
                </div>
              )}
            </div>

            <input
              type="number"
              name="budget"
              className="input"
              placeholder="Budget"
              value={formData.budget}
              onChange={handleChange}
              min="0"
              step="0.01"
            />

            {error && <div style={{ color: '#ff6b6b', fontSize: '14px' }}>{error}</div>}

            <button
              type="submit"
              className="button"
              disabled={loading}
              style={{ width: '100%', marginTop: '10px' }}
            >
              {loading ? 'Creating...' : 'Create Trip'}
            </button>
          </form>
        </div>

        {/* Suggestions for Places to Visit */}
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Suggestion for Places to Visit/</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
            gap: '20px' 
          }}>
            {suggestedCities.map((city, idx) => {
              const colorClasses = ['card-blue', 'card-green', 'card-purple', 'card-orange', 'card-pink', 'card-cyan'];
              const colorClass = colorClasses[idx % colorClasses.length];
              return (
                <div
                  key={city.id}
                  className={`container ${colorClass}`}
                  style={{
                    width: '100%',
                    height: '150px',
                    padding: 0,
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                  onClick={() => {
                    handleSelectCity(city);
                  }}
                >
                  <img
                    src={cityImages[city.id] || getCityImageUrl(city.name, city.country)}
                    alt={city.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Try fallback URL
                      const fallbackUrl = getCityImageUrl(city.name, city.country);
                      if (target.src !== fallbackUrl) {
                        target.src = fallbackUrl;
                      } else {
                        // If fallback also fails, show a colored background
                        target.style.display = 'none';
                      }
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                    color: 'white',
                    padding: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontWeight: 'bold' }}>{city.name}</div>
                    <div style={{ fontSize: '12px' }}>{city.country}</div>
                  </div>
                </div>
              );
            })}
            {suggestedCities.length < 6 && Array.from({ length: 6 - suggestedCities.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="container"
                style={{
                  width: '100%',
                  height: '150px',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;

