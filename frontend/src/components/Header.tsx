import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showSearch = false }) => {
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
      borderBottom: '1px solid #ffffff'
    }}>
      <Link to="/dashboard" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>
        GlobeTrotter
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {user && (
          <span style={{ fontSize: '16px' }}>
            {user.username || user.firstName || user.email}
          </span>
        )}
        <button className="button" onClick={handleLogout} style={{ padding: '8px 16px' }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;

