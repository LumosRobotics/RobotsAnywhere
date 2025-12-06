import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Products from './components/Products';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AuthModal from './components/AuthModal';
import UserAccount from './components/UserAccount';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import { CartProvider, useCart } from './contexts/CartContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { ShippingProvider } from './contexts/ShippingContext';
import './App.css';

// SearchResults component
function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      const categories = ['sensors', 'development-boards'];
      const allResults = [];

      for (const category of categories) {
        try {
          const response = await fetch(`/products/data/${category}.json`);
          if (response.ok) {
            const data = await response.json();
            const filteredProducts = data.products.filter(product =>
              product.name.toLowerCase().includes(query.toLowerCase()) ||
              product.description.toLowerCase().includes(query.toLowerCase()) ||
              product.shortDescription.toLowerCase().includes(query.toLowerCase())
            );

            filteredProducts.forEach(product => {
              product.categoryId = category;
              product.categoryName = data.categoryName;
            });

            allResults.push(...filteredProducts);
          }
        } catch (error) {
          console.error(`Error loading ${category} products:`, error);
        }
      }

      setSearchResults(allResults);
      setLoading(false);
    };

    if (query) {
      performSearch();
    }
  }, [query]);

  const handleProductClick = (product) => {
    navigate(`/products/${product.categoryId}/${product.id}`);
  };

  if (loading) {
    return <div className="loading">Searching...</div>;
  }

  return (
    <div className="search-results-container">
      <div className="search-results-header">
        <h2>Search Results for "{query}"</h2>
        <p>{searchResults.length} products found</p>
      </div>
      <div className="products-grid">
        {searchResults.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onProductClick={handleProductClick}
          />
        ))}
      </div>
    </div>
  );
}

// CheckoutSuccess component
function CheckoutSuccess() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useUser();
  const location = useLocation();
  const order = location.state?.order;

  useEffect(() => {
    // Clear the cart when the success page is loaded (only once on mount)
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  if (!order) {
    return (
      <div className="checkout-success-container">
        <div className="success-icon">⚠️</div>
        <h2>No Order Found</h2>
        <p>It looks like you accessed this page directly.</p>
        <button className="button" onClick={() => navigate('/')}>
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-success-container">
      <div className="success-icon">✅</div>
      <h2>Order Placed Successfully!</h2>
      <p className="order-number">Order #{order.id}</p>
      <div className="success-details">
        <p>Thank you for your purchase, {user?.firstName}!</p>
        <p>A confirmation email has been sent to {user?.email}</p>
        <p className="total-amount">Total: ${order.total.toFixed(2)}</p>
      </div>
      <div className="success-actions">
        <button className="button" onClick={() => navigate('/account/orders')}>
          View Order Details
        </button>
        <button className="button" onClick={() => navigate('/')}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();

    if (targetId === 'products') {
      navigate('/products');
      return;
    }

    if (targetId === 'home') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    navigate('/');

    // Small delay to ensure the page is rendered before scrolling
    setTimeout(() => {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleButtonClick = () => {
    alert('Welcome to Robots Anywhere! Explore our robotic solutions.');
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
  };

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthModalOpen(false);
  };

  const handleAccountClick = (action) => {
    navigate(`/account/${action}`);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCategoryClick = (categoryId) => {
    setIsMenuOpen(false);
    navigate(`/products/${categoryId}`);
  };

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleCheckoutSuccess = (order) => {
    if (!order) {
      alert('Failed to create order. Please try again.');
      return;
    }

    // Create a serializable version of the order for navigation state
    const serializableOrder = {
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.created_at || order.createdAt || new Date().toISOString(),
      items: (order.items || []).map(item => ({
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          images: item.product.images || []
        }
      }))
    };

    navigate('/checkout/success', {
      state: { order: serializableOrder },
      replace: true
    });
  };

  const handleCheckoutCancel = () => {
    navigate('/');
  };

  return (
        <div className="App">
          <Header
            onNavClick={handleNavClick}
            onCartClick={handleCartClick}
            onAuthClick={handleAuthClick}
            onAccountClick={handleAccountClick}
            onSearch={handleSearch}
            onCategoryClick={handleCategoryClick}
          />

          <div className="content-wrapper">
            
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
                    <li>
                      <button className="sidebar-link" onClick={() => handleCategoryClick('sensors')}>
                        Sensors
                      </button>
                    </li>
                    <li>
                      <button className="sidebar-link" onClick={() => handleCategoryClick('development-boards')}>
                        Development Boards
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <main className="main">
              <Routes>
                <Route path="/" element={
                  <>
                    <Home onButtonClick={() => alert('Welcome to Robots Anywhere! Explore our robotic solutions.')} />
                    <About />
                    <Contact />
                  </>
                } />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:category" element={<Products />} />
                <Route path="/products/:category/:productId" element={<Products />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/checkout" element={
                  <Checkout
                    onSuccess={handleCheckoutSuccess}
                    onCancel={handleCheckoutCancel}
                  />
                } />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/account/:view" element={<UserAccount onBack={() => navigate('/')} />} />
              </Routes>
            </main>
          </div>
          
          {/* Floating Cart Button */}
          <button className="floating-cart-button" onClick={handleCartClick}>
            <span className="cart-icon">🛒</span>
            {getCartItemCount() > 0 && (
              <span className="cart-counter">{getCartItemCount()}</span>
            )}
          </button>
          
          <Footer />
          
          {isCartOpen && (
            <div className="cart-overlay" onClick={handleCloseCart}>
              <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
                <Cart onClose={handleCloseCart} />
              </div>
            </div>
          )}
          
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={handleCloseAuth}
          />
        </div>
  );
}

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <ShippingProvider>
          <AppContent />
        </ShippingProvider>
      </CartProvider>
    </UserProvider>
  );
}

export default App;