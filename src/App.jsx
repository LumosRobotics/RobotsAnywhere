import React, { useState } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Products from './components/Products';
import Cart from './components/Cart';
import AuthModal from './components/AuthModal';
import UserAccount from './components/UserAccount';
import Footer from './components/Footer';
import Breadcrumb from './components/Breadcrumb';
import { CartProvider } from './contexts/CartContext';
import { UserProvider } from './contexts/UserContext';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [accountView, setAccountView] = useState('profile');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    
    if (targetId === 'products') {
      setCurrentPage('products');
      setSelectedCategory(null);
      setSelectedProduct(null);
      return;
    }
    
    setCurrentPage('home');
    setSelectedCategory(null);
    setSelectedProduct(null);
    
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

  const handleBreadcrumbNavigate = (type, data) => {
    if (type === 'home') {
      setCurrentPage('home');
      setSelectedCategory(null);
      setSelectedProduct(null);
    } else if (type === 'products') {
      setCurrentPage('products');
      setSelectedCategory(null);
      setSelectedProduct(null);
    } else if (type === 'category') {
      setCurrentPage('products');
      setSelectedCategory(data);
      setSelectedProduct(null);
    }
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
    if (action === 'profile') {
      setAccountView('profile');
      setCurrentPage('account');
    } else if (action === 'orders') {
      setAccountView('orders');
      setCurrentPage('account');
    } else if (action === 'settings') {
      setAccountView('settings');
      setCurrentPage('account');
    }
  };

  const handleBackFromAccount = () => {
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'products':
        return (
          <Products 
            selectedCategory={selectedCategory}
            selectedProduct={selectedProduct}
            onCategorySelect={setSelectedCategory}
            onProductSelect={setSelectedProduct}
          />
        );
      case 'account':
        return <UserAccount view={accountView} onBack={handleBackFromAccount} />;
      case 'home':
      default:
        return (
          <>
            <Home onButtonClick={handleButtonClick} />
            <About />
            <Contact />
          </>
        );
    }
  };

  return (
    <UserProvider>
      <CartProvider>
        <div className="App">
          <Header 
            onNavClick={handleNavClick} 
            onCartClick={handleCartClick}
            onAuthClick={handleAuthClick}
            onAccountClick={handleAccountClick}
            onCategorySelect={setSelectedCategory}
          />
          <main className="main">
            <Breadcrumb 
              currentPage={currentPage}
              selectedCategory={selectedCategory}
              selectedProduct={selectedProduct}
              onNavigate={handleBreadcrumbNavigate}
            />
            {renderPage()}
          </main>
          <Footer />
          
          {isCartOpen && (
            <div className="cart-overlay">
              <div className="cart-modal">
                <Cart onClose={handleCloseCart} />
              </div>
            </div>
          )}
          
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={handleCloseAuth}
          />
        </div>
      </CartProvider>
    </UserProvider>
  );
}

export default App;