'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Checkout from '@/components/Checkout';

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCart();

  // Redirect to home if cart is empty
  React.useEffect(() => {
    if (items.length === 0) {
      router.push('/');
    }
  }, [items, router]);

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart-message">
          <p>Your cart is empty. Please add items before checking out.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        <Suspense fallback={<div>Loading checkout...</div>}>
          <Checkout />
        </Suspense>
      </div>
    </div>
  );
}
