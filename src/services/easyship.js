/**
 * EasyShip API Service
 *
 * This service handles all interactions with the EasyShip API for shipping rates,
 * tax/duty calculations, and shipment creation.
 *
 * IMPORTANT: All requests go through a backend proxy to keep API tokens secure.
 * You must set up backend endpoints as documented in EASYSHIP_SETUP.md
 */

const API_BASE_URL = import.meta.env.VITE_EASYSHIP_API_URL || '/api';

/**
 * Format cart items for EasyShip API
 * Converts product data into EasyShip's expected format
 */
const formatItemsForEasyShip = (cartItems) => {
  return cartItems.map(item => ({
    actual_weight: item.product.weight || 0.1, // kg
    height: item.product.dimensions?.height || 1, // cm
    width: item.product.dimensions?.width || 1, // cm
    length: item.product.dimensions?.length || 1, // cm
    declared_currency: item.product.currency || 'USD',
    declared_customs_value: item.product.price * item.quantity,
    category: item.product.category || 'electronics',
    hs_code: item.product.hsCode || '',
    origin_country_alpha2: item.product.originCountry || 'US',
    quantity: item.quantity,
    description: item.product.name,
    sku: item.product.id
  }));
};

/**
 * Get shipping rates for cart items and destination
 *
 * @param {Array} cartItems - Array of cart items with product details
 * @param {Object} destination - Destination address object
 * @param {string} destination.country - Two-letter country code (e.g., 'US')
 * @param {string} destination.postal_code - Postal/ZIP code
 * @param {string} destination.city - City name
 * @param {string} destination.state - State/province code (for US, CA, MX, AU)
 * @returns {Promise<Object>} Shipping rates response
 */
export const getShippingRates = async (cartItems, destination) => {
  try {
    if (!cartItems || cartItems.length === 0) {
      throw new Error('No items in cart');
    }

    if (!destination || !destination.country || !destination.postal_code) {
      throw new Error('Destination address is incomplete');
    }

    const items = formatItemsForEasyShip(cartItems);

    const response = await fetch(`${API_BASE_URL}/shipping/rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination,
        items
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Transform response to a more usable format
    return {
      success: true,
      rates: data.rates || [],
      message: data.message
    };
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    return {
      success: false,
      rates: [],
      error: error.message
    };
  }
};

/**
 * Calculate taxes and duties for international shipments
 *
 * @param {Array} cartItems - Array of cart items
 * @param {Object} destination - Destination address
 * @param {number} shippingCost - Selected shipping cost
 * @returns {Promise<Object>} Taxes and duties calculation
 */
export const calculateTaxesAndDuties = async (cartItems, destination, shippingCost = 0) => {
  try {
    if (!cartItems || cartItems.length === 0) {
      throw new Error('No items in cart');
    }

    const items = cartItems.map(item => ({
      declared_customs_value: item.product.price * item.quantity,
      declared_currency: item.product.currency || 'USD',
      hs_code: item.product.hsCode || '',
      quantity: item.quantity,
      origin_country_alpha2: item.product.originCountry || 'US'
    }));

    const response = await fetch(`${API_BASE_URL}/shipping/taxes-duties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination_country: destination.country,
        origin_country: items[0]?.origin_country_alpha2 || 'US',
        items,
        shipping_charge: shippingCost
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      taxes: data.taxes || 0,
      duties: data.duties || 0,
      total: data.total || 0,
      breakdown: data.breakdown || {}
    };
  } catch (error) {
    console.error('Error calculating taxes and duties:', error);
    return {
      success: false,
      taxes: 0,
      duties: 0,
      total: 0,
      error: error.message
    };
  }
};

/**
 * Create a shipment after successful order
 *
 * @param {Object} orderData - Order data object
 * @param {string} orderData.orderId - Order ID from database
 * @param {Object} orderData.courier - Selected courier/rate information
 * @param {Object} orderData.recipient - Recipient address and contact info
 * @param {Array} orderData.items - Order items
 * @returns {Promise<Object>} Shipment creation response
 */
export const createShipment = async (orderData) => {
  try {
    const { orderId, courier, recipient, items } = orderData;

    if (!orderId || !courier || !recipient || !items) {
      throw new Error('Missing required shipment data');
    }

    const shipmentItems = formatItemsForEasyShip(items);

    const response = await fetch(`${API_BASE_URL}/shipping/shipment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId,
        courier_id: courier.courier_id,
        recipient: {
          name: recipient.name,
          email: recipient.email,
          phone: recipient.phone || '',
          company_name: recipient.company || '',
          address: {
            line_1: recipient.address.line1 || recipient.address.street,
            line_2: recipient.address.line2 || '',
            city: recipient.address.city,
            state: recipient.address.state,
            postal_code: recipient.address.postal_code || recipient.address.zipCode,
            country_alpha2: recipient.address.country
          }
        },
        items: shipmentItems,
        selected_rate: courier
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      shipment: {
        id: data.shipment_id,
        trackingNumber: data.tracking_number,
        labelUrl: data.label_url,
        courierName: data.courier_name,
        estimatedDelivery: data.estimated_delivery_date,
        status: data.status
      }
    };
  } catch (error) {
    console.error('Error creating shipment:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Format shipping rates for display in UI
 * Groups rates by delivery speed and sorts by price
 */
export const formatRatesForDisplay = (rates) => {
  if (!rates || rates.length === 0) return [];

  return rates.map(rate => ({
    id: rate.courier_id,
    name: rate.courier_name,
    serviceName: rate.courier_display_name || rate.courier_name,
    price: rate.total_charge,
    currency: rate.currency,
    minDeliveryTime: rate.min_delivery_time,
    maxDeliveryTime: rate.max_delivery_time,
    deliveryTimeFormatted: formatDeliveryTime(rate.min_delivery_time, rate.max_delivery_time),
    description: rate.description || '',
    isInsured: rate.is_insured || false,
    trackingAvailable: rate.tracking_available !== false,
    courierData: rate // Keep full rate data for shipment creation
  })).sort((a, b) => a.price - b.price);
};

/**
 * Format delivery time for display
 */
const formatDeliveryTime = (minDays, maxDays) => {
  if (!minDays && !maxDays) return 'Delivery time varies';

  if (minDays === maxDays) {
    return `${minDays} business ${minDays === 1 ? 'day' : 'days'}`;
  }

  if (!minDays) return `Up to ${maxDays} business days`;
  if (!maxDays) return `${minDays}+ business days`;

  return `${minDays}-${maxDays} business days`;
};

/**
 * Validate address for shipping
 */
export const validateShippingAddress = (address) => {
  const errors = [];

  if (!address.line1 && !address.street) {
    errors.push('Street address is required');
  }

  if (!address.city) {
    errors.push('City is required');
  }

  if (!address.postal_code && !address.zipCode) {
    errors.push('Postal code is required');
  }

  if (!address.country) {
    errors.push('Country is required');
  }

  // State is required for US, Canada, Mexico, Australia
  const stateRequiredCountries = ['US', 'CA', 'MX', 'AU'];
  if (stateRequiredCountries.includes(address.country) && !address.state) {
    errors.push('State/Province is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Mock shipping rates for development/testing
 * Use when backend is not available
 */
export const getMockShippingRates = (cartTotal) => {
  return {
    success: true,
    rates: [
      {
        id: 'standard',
        name: 'Standard Shipping',
        serviceName: 'USPS Priority Mail',
        price: cartTotal > 100 ? 0 : 9.99,
        currency: 'USD',
        minDeliveryTime: 3,
        maxDeliveryTime: 5,
        deliveryTimeFormatted: '3-5 business days',
        description: 'Free shipping on orders over $100',
        isInsured: false,
        trackingAvailable: true
      },
      {
        id: 'express',
        name: 'Express Shipping',
        serviceName: 'FedEx 2Day',
        price: 24.99,
        currency: 'USD',
        minDeliveryTime: 2,
        maxDeliveryTime: 2,
        deliveryTimeFormatted: '2 business days',
        description: 'Faster delivery',
        isInsured: true,
        trackingAvailable: true
      },
      {
        id: 'overnight',
        name: 'Overnight Shipping',
        serviceName: 'FedEx Priority Overnight',
        price: 49.99,
        currency: 'USD',
        minDeliveryTime: 1,
        maxDeliveryTime: 1,
        deliveryTimeFormatted: '1 business day',
        description: 'Next business day delivery',
        isInsured: true,
        trackingAvailable: true
      }
    ]
  };
};

export default {
  getShippingRates,
  calculateTaxesAndDuties,
  createShipment,
  formatRatesForDisplay,
  validateShippingAddress,
  getMockShippingRates
};
