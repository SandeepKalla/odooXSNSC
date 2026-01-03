import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '20px',
      borderBottom: '1px solid var(--border-primary)',
      backgroundColor: '#ffffff'
    }}>
      <Link to="/dashboard" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>
        GlobeTrotter
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {user && (
          <>
            <Link 
              to="/profile" 
              style={{ 
                color: 'var(--text-primary)', 
                textDecoration: 'none', 
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              {user.username || user.firstName || user.email}
            </Link>
            <Link 
              to="/admin" 
              style={{ 
                color: 'var(--text-primary)', 
                textDecoration: 'none', 
                fontSize: '14px',
                cursor: 'pointer',
                padding: '8px 12px',
                border: '1px solid var(--border-primary)',
                borderRadius: '4px'
              }}
            >
              Admin
            </Link>
          </>
        )}
        <button className="button" onClick={handleLogout} style={{ padding: '8px 16px' }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;

