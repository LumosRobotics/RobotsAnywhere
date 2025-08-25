import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';

const Header = ({ onNavClick, onCartClick, onAuthClick, onAccountClick, onCategorySelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const { getCartItemCount } = useCart();
  const { isAuthenticated, user, logout } = useUser();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log('Searching for:', searchTerm);
      // Add search functionality here
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setIsAccountDropdownOpen(false);
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
    { id: 'service', name: 'Service Robots' },
    { id: 'cleaning', name: 'Cleaning Robots' }
  ];

  return (
    <header className="header">
      <div className="header-content">
        <button className="hamburger-menu" onClick={toggleMenu}>
          <div className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></div>
          <div className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></div>
          <div className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></div>
        </button>
        
        <div className="logo" onClick={(e) => onNavClick(e, 'home')}>
          <img src="/Robotsdigitalcoverart.webp" alt="Robots Anywhere Logo" />
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
            🔍
          </button>
        </form>
        
        <button className="cart-button" onClick={onCartClick}>
          <span className="cart-icon">🛒</span>
          {getCartItemCount() > 0 && (
            <span className="cart-counter">{getCartItemCount()}</span>
          )}
        </button>

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