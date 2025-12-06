import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';

const Cart = ({ onClose }) => {
  const navigate = useNavigate();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount
  } = useCart();
  const { isAuthenticated } = useUser();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!isAuthenticated) {
      alert('Please sign in to continue with checkout');
      return;
    }

    // Close cart modal and navigate to checkout
    onClose();
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <h2>Shopping Cart</h2>
          <button className="close-cart-btn" onClick={onClose}>×</button>
        </div>
        <div className="cart-empty">
          <div className="empty-cart-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some amazing robot components to get started!</p>
          <button className="continue-shopping-btn" onClick={onClose}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Shopping Cart ({getCartItemCount()} items)</h2>
        <button className="close-cart-btn" onClick={onClose}>×</button>
      </div>

      <div className="cart-items">
        {items.map((item) => (
          <div key={item.product.id} className="cart-item">
            <div className="cart-item-image">
              <img 
                src={item.product.images[0]} 
                alt={item.product.name}
                onError={(e) => {
                  e.target.src = '/api/placeholder/100/80';
                }}
              />
            </div>
            
            <div className="cart-item-details">
              <h3 className="cart-item-name">{item.product.name}</h3>
              <p className="cart-item-description">{item.product.shortDescription}</p>
              <div className="cart-item-price">
                {formatPrice(item.product.price)} each
              </div>
            </div>
            
            <div className="cart-item-controls">
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                >
                  -
                </button>
                <span className="quantity-display">{item.quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stockCount}
                >
                  +
                </button>
              </div>
              
              <div className="cart-item-total">
                {formatPrice(item.product.price * item.quantity)}
              </div>
              
              <button 
                className="remove-btn"
                onClick={() => removeFromCart(item.product.id)}
                title="Remove from cart"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-actions">
          <button className="clear-cart-btn" onClick={clearCart}>
            Clear Cart
          </button>
          <button className="continue-shopping-btn" onClick={onClose}>
            Continue Shopping
          </button>
        </div>
        
        <div className="cart-total">
          <div className="total-row">
            <span className="total-label">Subtotal:</span>
            <span className="total-value">{formatPrice(getCartTotal())}</span>
          </div>
          <div className="total-row">
            <span className="total-label">Shipping:</span>
            <span className="total-value shipping-note">Calculated at checkout</span>
          </div>
          <div className="total-row total-final">
            <span className="total-label">Estimated Total:</span>
            <span className="total-value">{formatPrice(getCartTotal())}</span>
          </div>
        </div>
        
        <button className="checkout-btn" onClick={handleCheckout}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;