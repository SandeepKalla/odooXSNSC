import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/global.css';

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    country: '',
    additionalInfo: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="container" style={{ padding: '40px', maxWidth: '500px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Registration Screen (Screen 2)</h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            border: '1px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            Photo
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              name="firstName"
              className="input"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              style={{ flex: 1 }}
            />
            <input
              type="text"
              name="lastName"
              className="input"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              style={{ flex: 1 }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="email"
              name="email"
              className="input"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ flex: 1 }}
            />
            <input
              type="tel"
              name="phone"
              className="input"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              style={{ flex: 1 }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              name="city"
              className="input"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              style={{ flex: 1 }}
            />
            <input
              type="text"
              name="country"
              className="input"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              style={{ flex: 1 }}
            />
          </div>

          <input
            type="text"
            name="username"
            className="input"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            className="input"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <textarea
            name="additionalInfo"
            className="textarea"
            placeholder="Additional Information ...."
            value={formData.additionalInfo}
            onChange={handleChange}
            rows={4}
          />

          {error && <div style={{ color: '#ff6b6b', fontSize: '14px' }}>{error}</div>}

          <button
            type="submit"
            className="button"
            disabled={loading}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? 'Registering...' : 'Register Users'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#ffffff', textDecoration: 'underline' }}>
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;

