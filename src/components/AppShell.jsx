'use client';

import React, { useState } from 'react';
import Header from './Header';
import Cart from './Cart';
import AuthModal from './AuthModal';
import { useCart } from '@/contexts/CartContext';

export default function AppShell({ children }) {
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { getCartItemCount } = useCart();

  const handleCartClick = () => {
    setShowCart(true);
  };

  const handleCartClose = () => {
    setShowCart(false);
  };

  const handleAuthClick = () => {
    setShowAuthModal(true);
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
  };

  return (
    <>
      <Header
        onAuthClick={handleAuthClick}
      />

      <main>
        {children}
      </main>

      {/* Floating Cart Button - Bottom Right */}
      <button
        className="floating-cart-button"
        onClick={handleCartClick}
        aria-label="Shopping Cart"
      >
        <span className="cart-icon">🛒</span>
        {getCartItemCount() > 0 && (
          <span className="cart-counter">{getCartItemCount()}</span>
        )}
      </button>

      {showCart && (
        <Cart onClose={handleCartClose} />
      )}

      {showAuthModal && (
        <AuthModal onClose={handleAuthClose} />
      )}
    </>
  );
}
