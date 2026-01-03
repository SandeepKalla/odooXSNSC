import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { api } from '../services/api';
import '../styles/global.css';

interface City {
  id: string;
  name: string;
  country: string;
}

const CreateTrip = () => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    budget: '',
    cityId: '',
  });
  const [suggestedCities, setSuggestedCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadSuggestions = async () => {
      const response = await api.searchCities();
      if (response.data?.cities) {
        setSuggestedCities(response.data.cities.slice(0, 6));
      }
    };
    loadSuggestions();
  }, []);

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
              placeholder="a new trip"
              value={formData.name}
              onChange={handleChange}
              required
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

            <input
              type="text"
              className="input"
              placeholder="Select a Place:"
              readOnly
              value={formData.cityId ? suggestedCities.find(c => c.id === formData.cityId)?.name || '' : ''}
            />

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
            gridTemplateColumns: 'repeat(3, 1fr)', 
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
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => setFormData({ ...formData, cityId: city.id })}
                >
                  <div>{city.name}</div>
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>{city.country}</div>
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

