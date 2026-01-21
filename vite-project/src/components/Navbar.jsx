import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/Authcontext';
import '../styles/Navbar.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        <Link className="navbar-brand" to="/">
          <span className="brand-icon">⚙️</span>
          <span className="brand-text">Maintenance Tracker</span>
        </Link>
        
        <button className="menu-toggle" onClick={toggleMenu}>
          <span className={isOpen ? 'open' : ''}></span>
          <span className={isOpen ? 'open' : ''}></span>
          <span className={isOpen ? 'open' : ''}></span>
        </button>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <div className="nav-links">
            {user ? (
              <>
                <Link className="nav-item" to="/" onClick={() => setIsOpen(false)}>
                  <span className="nav-icon">📊</span>
                  <span>Dashboard</span>
                </Link>
                <Link className="nav-item" to="/assets" onClick={() => setIsOpen(false)}>
                  <span className="nav-icon">🏭</span>
                  <span>Assets</span>
                </Link>
                <Link className="nav-item" to="/work-orders" onClick={() => setIsOpen(false)}>
                  <span className="nav-icon">📋</span>
                  <span>Work Orders</span>
                </Link>
                {user.role === 'Admin' && (
                  <Link className="nav-item" to="/admin" onClick={() => setIsOpen(false)}>
                    <span className="nav-icon">👨‍💼</span>
                    <span>Admin</span>
                  </Link>
                )}
                {(user.role === 'Manager' || user.role === 'Admin') && (
                  <Link className="nav-item" to="/manager" onClick={() => setIsOpen(false)}>
                    <span className="nav-icon">📈</span>
                    <span>Manager</span>
                  </Link>
                )}
                {user.role === 'Technician' && (
                  <Link className="nav-item" to="/technician" onClick={() => setIsOpen(false)}>
                    <span className="nav-icon">🔧</span>
                    <span>My Tasks</span>
                  </Link>
                )}
              </>
            ) : (
              <Link className="nav-item" to="/login" onClick={() => setIsOpen(false)}>
                <span className="nav-icon">🔐</span>
                <span>Login</span>
              </Link>
            )}
          </div>
          {user && (
            <div className="nav-user-section">
              <span className="user-info">👤 {user.name || user.email}</span>
              <button className="logout-btn" onClick={() => { logout(); setIsOpen(false); }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
export default Navbar;