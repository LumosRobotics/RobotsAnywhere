import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import { useShipping } from '../contexts/ShippingContext';
import { useNavigate } from 'react-router-dom';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { items, getCartTotal } = useCart();
  const { user, addOrder } = useUser();
  const {
    fetchShippingRates,
    selectShippingMethod,
    fetchTaxesAndDuties,
    availableRates,
    selectedShippingMethod,
    getShippingTotal,
    getShippingBreakdown,
    isLoading: shippingLoading,
    error: shippingError,
    setUseMockData
  } = useShipping();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Shipping Address, 2: Shipping Method, 3: Payment
  const [billingDetails, setBillingDetails] = useState({
    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email: user?.email || '',
    address: {
      line1: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      postal_code: user?.address?.zipCode || '',
      country: 'US'
    }
  });
  const [shippingAddress, setShippingAddress] = useState({
    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    line1: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postal_code: user?.address?.zipCode || '',
    country: 'US'
  });
  const [sameAsBilling, setSameAsBilling] = useState(true);

  // Enable mock data for development (set to false when backend is ready)
  useEffect(() => {
    setUseMockData(true); // Change to false when backend API is set up
  }, [setUseMockData]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setBillingDetails(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setBillingDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleShippingAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProceedToShipping = async () => {
    setError(null);

    // Validate shipping address
    const address = sameAsBilling ? billingDetails.address : shippingAddress;
    if (!address.line1 || !address.city || !address.postal_code || !address.country) {
      setError('Please fill in all required shipping address fields');
      return;
    }

    // Fetch shipping rates
    const destination = {
      country: address.country,
      postal_code: address.postal_code,
      city: address.city,
      state: address.state
    };

    const result = await fetchShippingRates(items, destination);

    if (result.success && result.rates.length > 0) {
      setStep(2); // Move to shipping method selection
    } else {
      setError(shippingError || 'No shipping options available for this address');
    }
  };

  const handleSelectShipping = (rate) => {
    selectShippingMethod(rate);
  };

  const handleProceedToPayment = async () => {
    if (!selectedShippingMethod) {
      setError('Please select a shipping method');
      return;
    }

    // Calculate taxes and duties if international
    const address = sameAsBilling ? billingDetails.address : shippingAddress;
    if (address.country !== 'US') {
      await fetchTaxesAndDuties(items, address, selectedShippingMethod.price);
    }

    setStep(3); // Move to payment
  };

  const handleBackToAddress = () => {
    setStep(1);
  };

  const handleBackToShipping = () => {
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // In a real implementation, you would:
      // 1. Create a payment intent on your backend
      // 2. Use the client secret to confirm the payment

      // For now, we'll simulate a successful payment
      // You'll need to implement a backend endpoint for this

      const cardElement = elements.getElement(CardElement);

      // Create a payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails,
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      // TODO: Send paymentMethod.id to your backend to create a payment intent
      // For now, we'll just create the order locally

      const shippingBreakdown = getShippingBreakdown();
      const finalAddress = sameAsBilling ? billingDetails.address : shippingAddress;

      const order = await addOrder({
        items: items.map(item => ({
          product: item.product,
          quantity: item.quantity
        })),
        subtotal: getCartTotal(),
        shippingCost: shippingBreakdown.shippingCost,
        taxesDuties: shippingBreakdown.taxes + shippingBreakdown.duties,
        total: getCartTotal() + getShippingTotal(),
        status: 'pending',
        paymentMethodId: paymentMethod.id,
        shippingMethod: selectedShippingMethod,
        shippingAddress: finalAddress
      });

      if (!order) {
        setError('Failed to create order. Please try again.');
        setProcessing(false);
        return;
      }

      // Don't clear cart here - it will be cleared on the success page
      // Clearing it here causes the Checkout component's useEffect to redirect

      // Reset processing state
      setProcessing(false);

      // Show success page (cart will be cleared there)
      onSuccess(order);

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'An unexpected error occurred');
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  // Render different steps
  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="checkout-step">
          <h3>Shipping Address</h3>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={billingDetails.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={billingDetails.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address.line1">Street Address</label>
            <input
              type="text"
              id="address.line1"
              name="address.line1"
              value={billingDetails.address.line1}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address.city">City</label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={billingDetails.address.city}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address.state">State</label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                value={billingDetails.address.state}
                onChange={handleInputChange}
                required
                maxLength="2"
                placeholder="CA"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address.postal_code">ZIP Code</label>
              <input
                type="text"
                id="address.postal_code"
                name="address.postal_code"
                value={billingDetails.address.postal_code}
                onChange={handleInputChange}
                required
                maxLength="10"
              />
            </div>
          </div>

          {error && <div className="checkout-error">{error}</div>}
          {shippingError && <div className="checkout-error">{shippingError}</div>}

          <div className="checkout-actions">
            <button type="button" className="cancel-checkout-btn" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="submit-payment-btn"
              onClick={handleProceedToShipping}
              disabled={shippingLoading}
            >
              {shippingLoading ? 'Loading Rates...' : 'Continue to Shipping'}
            </button>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="checkout-step">
          <h3>Select Shipping Method</h3>

          {shippingLoading ? (
            <div className="shipping-loading">Loading shipping options...</div>
          ) : availableRates.length > 0 ? (
            <div className="shipping-options">
              {availableRates.map((rate) => (
                <div
                  key={rate.id}
                  className={`shipping-option ${selectedShippingMethod?.id === rate.id ? 'selected' : ''}`}
                  onClick={() => handleSelectShipping(rate)}
                >
                  <div className="shipping-option-details">
                    <div className="shipping-option-name">{rate.serviceName}</div>
                    <div className="shipping-option-time">{rate.deliveryTimeFormatted}</div>
                    {rate.description && (
                      <div className="shipping-option-description">{rate.description}</div>
                    )}
                  </div>
                  <div className="shipping-option-price">
                    {formatPrice(rate.price)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="checkout-error">No shipping options available</div>
          )}

          {error && <div className="checkout-error">{error}</div>}

          <div className="checkout-actions">
            <button type="button" className="cancel-checkout-btn" onClick={handleBackToAddress}>
              Back to Address
            </button>
            <button
              type="button"
              className="submit-payment-btn"
              onClick={handleProceedToPayment}
              disabled={!selectedShippingMethod}
            >
              Continue to Payment
            </button>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <form onSubmit={handleSubmit} className="checkout-step">
          <h3>Payment Information</h3>

          <div className="form-group">
            <label>Card Details</label>
            <div className="card-element-container">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {error && <div className="checkout-error">{error}</div>}

          <div className="checkout-actions">
            <button
              type="button"
              className="cancel-checkout-btn"
              onClick={handleBackToShipping}
              disabled={processing}
            >
              Back to Shipping
            </button>
            <button
              type="submit"
              className="submit-payment-btn"
              disabled={!stripe || processing}
            >
              {processing ? 'Processing...' : `Pay ${formatPrice(getCartTotal() + getShippingTotal())}`}
            </button>
          </div>
        </form>
      );
    }
  };

  return (
    <div className="checkout-form">
      <div className="checkout-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          1. Shipping
        </div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          2. Method
        </div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          3. Payment
        </div>
      </div>
      {renderStep()}
    </div>
  );
};

const Checkout = ({ onSuccess, onCancel }) => {
  const { items, getCartTotal } = useCart();
  const { isAuthenticated } = useUser();
  const { getShippingTotal, getShippingBreakdown, selectedShippingMethod } = useShipping();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if cart is empty or user is not authenticated
    if (items.length === 0) {
      navigate('/');
    }
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [items, isAuthenticated, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h2>Checkout</h2>
      </div>

      <div className="checkout-content">
        <div className="checkout-main">
          <Elements stripe={stripePromise}>
            <CheckoutForm onSuccess={onSuccess} onCancel={onCancel} />
          </Elements>
        </div>

        <div className="checkout-sidebar">
          <div className="order-summary">
            <h3>Order Summary</h3>

            <div className="order-items">
              {items.map(item => (
                <div key={item.product.id} className="order-item">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    onError={(e) => {
                      e.target.src = '/api/placeholder/60/60';
                    }}
                  />
                  <div className="order-item-details">
                    <p className="item-name">{item.product.name}</p>
                    <p className="item-quantity">Qty: {item.quantity}</p>
                  </div>
                  <p className="item-price">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>
                  {selectedShippingMethod
                    ? formatPrice(getShippingBreakdown().shippingCost)
                    : 'Calculated at checkout'}
                </span>
              </div>
              {getShippingBreakdown().taxes + getShippingBreakdown().duties > 0 && (
                <div className="total-row">
                  <span>Taxes & Duties:</span>
                  <span>{formatPrice(getShippingBreakdown().taxes + getShippingBreakdown().duties)}</span>
                </div>
              )}
              <div className="total-row total-final">
                <span>Total:</span>
                <span>
                  {selectedShippingMethod
                    ? formatPrice(getCartTotal() + getShippingTotal())
                    : formatPrice(getCartTotal())}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
