import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfilePhotoUrl } from '../utils/images';
import '../styles/global.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: '#ffffff' }}>
      <div className="container" style={{ padding: '40px', maxWidth: '400px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Login</h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <img
            src={getProfilePhotoUrl('User', 100)}
            alt="Profile"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '1px solid var(--border-primary)',
              objectFit: 'cover'
            }}
          />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input
            type="text"
            className="input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%' }}
          />
          
          <input
            type="password"
            className="input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%' }}
          />

          {error && <div style={{ color: '#ff6b6b', fontSize: '14px' }}>{error}</div>}

          <div style={{ textAlign: 'right' }}>
            <Link to="#" style={{ color: 'var(--accent-blue)', textDecoration: 'underline', fontSize: '14px' }}>
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="button"
            disabled={loading}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

