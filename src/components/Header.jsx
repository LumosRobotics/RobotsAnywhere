import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';

const Header = ({ onNavClick, onCartClick, onAuthClick, onAccountClick, onCategorySelect, onSearch, onCategoryClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const { getCartItemCount } = useCart();
  const { isAuthenticated, user, logout } = useUser();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm.trim());
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsAccountDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
      setIsAccountDropdownOpen(false);
    }
  };

  const handleAccountAction = (action) => {
    setIsAccountDropdownOpen(false);
    if (onAccountClick) {
      onAccountClick(action);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setIsMenuOpen(false);
    // Navigate to products page and select the category
    if (onNavClick) {
      onNavClick({ preventDefault: () => {} }, 'products');
    }
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  const handleShopClick = (shopType) => {
    setIsMenuOpen(false);
    // For now, navigate to products page - can be extended later for specific shop sections
    if (onNavClick) {
      onNavClick({ preventDefault: () => {} }, 'products');
    }
    // Could add specific filtering logic here based on shopType
    console.log('Shop section clicked:', shopType);
  };

  const productCategories = [
    { id: 'sensors', name: 'Sensors' },
    { id: 'actuators', name: 'Actuators' },
    { id: 'connectivity', name: 'Connectivity' },
    { id: 'location', name: 'Location' },
    { id: 'camera', name: 'Camera' },
    { id: 'industrial', name: 'Industrial Robots' },
    { id: 'service', name: 'Service Robots' }
  ];

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={(e) => onNavClick(e, 'home')}>
          <img src="/RobotsAnywhereLogo.png" alt="Robots Anywhere Logo" />
        </div>

        <div className="header-nav">
          <button className="header-nav-button" onClick={toggleMenu}>
            Products
          </button>
          <button className="header-nav-button" onClick={(e) => onNavClick && onNavClick(e, 'about')}>
            About
          </button>
          <button className="header-nav-button" onClick={(e) => onNavClick && onNavClick(e, 'contact')}>
            Contact
          </button>
        </div>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search robots and products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6.5" cy="6.5" r="5" stroke="black" strokeWidth="1.5"/>
              <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </form>
        

        <div className="account-section">
          {isAuthenticated ? (
            <div className="account-dropdown">
              <button className="account-button" onClick={toggleAccountDropdown}>
                <span className="account-icon">👤</span>
                <span className="account-name">{user?.firstName}</span>
                <span className={`dropdown-arrow ${isAccountDropdownOpen ? 'open' : ''}`}>▼</span>
              </button>
              
              {isAccountDropdownOpen && (
                <div className="account-menu">
                  <div className="account-menu-header">
                    <p className="account-greeting">Hello, {user?.firstName}!</p>
                    <p className="account-email">{user?.email}</p>
                  </div>
                  <ul>
                    <li>
                      <button onClick={() => handleAccountAction('profile')}>
                        👤 My Profile
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleAccountAction('orders')}>
                        📦 My Orders
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleAccountAction('settings')}>
                        ⚙️ Account Settings
                      </button>
                    </li>
                    <li className="account-menu-divider">
                      <button onClick={handleLogout}>
                        🚪 Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <button className="auth-button" onClick={onAuthClick}>
              <span className="auth-icon">👤</span>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Sidebar Menu Overlay */}
      {isMenuOpen && <div className="sidebar-overlay" onClick={toggleMenu}></div>}
      
      {/* Sidebar Menu */}
      <div className={`sidebar-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button className="sidebar-close" onClick={toggleMenu}>×</button>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3>Product Categories</h3>
            <ul>
              {productCategories.map((category, index) => (
                <li key={index}>
                  <button 
                    className="sidebar-link"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="sidebar-section">
            <h3>Shop</h3>
            <ul>
              <li>
                <button 
                  className="sidebar-link"
                  onClick={() => handleShopClick('all-products')}
                >
                  All Products
                </button>
              </li>
              <li>
                <button 
                  className="sidebar-link"
                  onClick={() => handleShopClick('new-arrivals')}
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button 
                  className="sidebar-link"
                  onClick={() => handleShopClick('bestsellers')}
                >
                  Bestsellers
                </button>
              </li>
              <li>
                <button 
                  className="sidebar-link"
                  onClick={() => handleShopClick('deals')}
                >
                  Special Deals
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
    </header>
  );
};

export default Header;