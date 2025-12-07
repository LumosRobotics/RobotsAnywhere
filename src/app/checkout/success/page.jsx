'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get('orderId');
  const total = searchParams.get('total');

  useEffect(() => {
    // Clear cart on successful checkout
    clearCart();
  }, [clearCart]);

  return (
    <div className="checkout-success-page">
      <div className="container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Order Confirmed!</h1>
          <p className="success-message">
            Thank you for your order. Your purchase has been successfully processed.
          </p>

          {orderId && (
            <div className="order-details">
              <p><strong>Order Number:</strong> {orderId}</p>
              {total && <p><strong>Total:</strong> ${parseFloat(total).toFixed(2)}</p>}
            </div>
          )}

          <p className="info-text">
            A confirmation email has been sent to your email address with order details
            and tracking information.
          </p>

          <div className="action-buttons">
            <Link href="/account/orders" className="btn btn-primary">
              View Order Details
            </Link>
            <Link href="/products" className="btn btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccessContent />
    </React.Suspense>
  );
}
