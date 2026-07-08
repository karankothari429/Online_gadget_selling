import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, LayoutDashboard, Cpu, Menu, X, Search } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Synchronize Navbar search field with URL query parameters
  useEffect(() => {
    const term = searchParams.get('search') || '';
    setSearchKeyword(term);
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/?search=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          <Cpu className="logo-icon" />
          <span className="logo-text">Gadget<span className="cyan-text">Galaxy</span></span>
        </Link>

        {/* Global Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="nav-search-form-desktop">
          <Search size={16} className="nav-search-icon" />
          <input
            type="text"
            placeholder="Search futuristic gadgets..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="form-input nav-search-input"
          />
        </form>

        {/* Desktop Menu */}
        <div className="navbar-menu-desktop">
          <Link to="/" className="nav-link">Catalog</Link>
          <Link to="/cart" className="nav-link cart-link-btn">
            <ShoppingCart size={18} />
            Cart
            {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
          </Link>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link admin-link-btn">
                  <LayoutDashboard size={16} />
                  Admin
                </Link>
              )}
              <Link to="/profile" className="profile-badge-link">
                <img src={user.avatar} alt={user.name} className="nav-avatar" />
                <span className="nav-username">{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn-nav" title="Log Out">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <div className="auth-buttons-group">
              <Link to="/login" className="btn-nav-login">Sign In</Link>
              <Link to="/signup" className="btn-nav-signup btn-primary">Join</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button className="mobile-toggle-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Global Product Category Sub-Navigation Bar */}
      <div className="navbar-subnav">
        <div className="subnav-container">
          <Link to="/?category=All" className="subnav-item">All Products</Link>
          <Link to="/?category=Laptops" className="subnav-item">💻 Laptops</Link>
          <Link to="/?category=Wearables" className="subnav-item">🥽 Wearables</Link>
          <Link to="/?category=Audio" className="subnav-item">🔊 Audio</Link>
          <Link to="/?category=Accessories" className="subnav-item">⌨️ Accessories</Link>
          <Link to="/support" className="subnav-item subnav-support-link">🛠️ Technical Support</Link>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="navbar-menu-mobile">
          {/* Mobile Search input */}
          <form onSubmit={handleSearchSubmit} className="nav-search-form-mobile">
            <Search size={16} className="nav-search-icon" />
            <input
              type="text"
              placeholder="Search gadgets..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="form-input nav-search-input"
              onClick={(e) => e.stopPropagation()}
            />
          </form>

          <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Catalog</Link>
          <div style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <Link to="/?category=Laptops" className="mobile-nav-link" style={{ fontSize: '0.9rem', border: 'none', padding: '0.2rem 0' }} onClick={() => setMobileMenuOpen(false)}>💻 Laptops</Link>
            <Link to="/?category=Wearables" className="mobile-nav-link" style={{ fontSize: '0.9rem', border: 'none', padding: '0.2rem 0' }} onClick={() => setMobileMenuOpen(false)}>🥽 Wearables</Link>
            <Link to="/?category=Audio" className="mobile-nav-link" style={{ fontSize: '0.9rem', border: 'none', padding: '0.2rem 0' }} onClick={() => setMobileMenuOpen(false)}>🔊 Audio</Link>
            <Link to="/?category=Accessories" className="mobile-nav-link" style={{ fontSize: '0.9rem', border: 'none', padding: '0.2rem 0' }} onClick={() => setMobileMenuOpen(false)}>⌨️ Accessories</Link>
          </div>
          <Link to="/support" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>🛠️ Help & Support</Link>
          
          <Link to="/cart" className="mobile-nav-link mobile-cart-link" onClick={() => setMobileMenuOpen(false)}>
            <ShoppingCart size={20} />
            Cart
            {getCartCount() > 0 && <span className="mobile-cart-badge">{getCartCount()}</span>}
          </Link>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard size={18} /> Admin Panel
                </Link>
              )}
              <Link to="/profile" className="mobile-nav-link mobile-profile-link" onClick={() => setMobileMenuOpen(false)}>
                <img src={user.avatar} alt={user.name} className="nav-avatar" />
                <span>My Profile ({user.name})</span>
              </Link>
              <button onClick={handleLogout} className="mobile-logout-btn">
                <LogOut size={18} /> Sign Out
              </button>
            </>
          ) : (
            <div className="mobile-auth-group">
              <Link to="/login" className="mobile-btn-login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/signup" className="mobile-btn-signup" onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );

};

export default Navbar;

