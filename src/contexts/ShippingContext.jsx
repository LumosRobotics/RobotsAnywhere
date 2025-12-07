'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  getShippingRates,
  calculateTaxesAndDuties,
  formatRatesForDisplay,
  validateShippingAddress,
  getMockShippingRates
} from '@/services/easyship';

const ShippingContext = createContext();

const shippingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload.isLoading,
        error: null
      };
    }

    case 'SET_ERROR': {
      return {
        ...state,
        isLoading: false,
        error: action.payload.error
      };
    }

    case 'SET_SHIPPING_ADDRESS': {
      return {
        ...state,
        shippingAddress: action.payload.address,
        error: null
      };
    }

    case 'SET_SHIPPING_RATES': {
      return {
        ...state,
        availableRates: action.payload.rates,
        isLoading: false,
        error: null,
        ratesLastFetched: new Date().toISOString()
      };
    }

    case 'SELECT_SHIPPING_METHOD': {
      return {
        ...state,
        selectedShippingMethod: action.payload.method,
        error: null
      };
    }

    case 'SET_TAXES_DUTIES': {
      return {
        ...state,
        taxesAndDuties: action.payload.data,
        isLoading: false
      };
    }

    case 'CLEAR_SHIPPING': {
      return {
        ...initialState
      };
    }

    case 'SET_USE_MOCK': {
      return {
        ...state,
        useMockData: action.payload.useMock
      };
    }

    default:
      return state;
  }
};

const initialState = {
  shippingAddress: null,
  availableRates: [],
  selectedShippingMethod: null,
  taxesAndDuties: null,
  isLoading: false,
  error: null,
  ratesLastFetched: null,
  useMockData: false // Set to true for development without backend
};

export const ShippingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(shippingReducer, initialState);

  /**
   * Set shipping address
   */
  const setShippingAddress = useCallback((address) => {
    // Validate address
    const validation = validateShippingAddress(address);

    if (!validation.isValid) {
      dispatch({
        type: 'SET_ERROR',
        payload: { error: validation.errors.join(', ') }
      });
      return { success: false, errors: validation.errors };
    }

    dispatch({
      type: 'SET_SHIPPING_ADDRESS',
      payload: { address }
    });

    return { success: true };
  }, []);

  /**
   * Fetch shipping rates for cart items and destination
   */
  const fetchShippingRates = useCallback(async (cartItems, destination) => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

    try {
      let result;

      // Use mock data if enabled (for development)
      if (state.useMockData) {
        const cartTotal = cartItems.reduce((sum, item) =>
          sum + (item.product.price * item.quantity), 0
        );
        result = getMockShippingRates(cartTotal);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // Call real API through backend proxy
        result = await getShippingRates(cartItems, destination);
      }

      if (result.success) {
        const formattedRates = formatRatesForDisplay(result.rates);
        dispatch({
          type: 'SET_SHIPPING_RATES',
          payload: { rates: formattedRates }
        });
        return { success: true, rates: formattedRates };
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: { error: result.error || 'Failed to fetch shipping rates' }
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: { error: error.message || 'Failed to fetch shipping rates' }
      });
      return { success: false, error: error.message };
    }
  }, [state.useMockData]);

  /**
   * Select a shipping method from available rates
   */
  const selectShippingMethod = useCallback((method) => {
    dispatch({
      type: 'SELECT_SHIPPING_METHOD',
      payload: { method }
    });
  }, []);

  /**
   * Calculate taxes and duties for international orders
   */
  const fetchTaxesAndDuties = useCallback(async (cartItems, destination, shippingCost) => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

    try {
      // Skip tax calculation for domestic shipments (same country as origin)
      const originCountry = cartItems[0]?.product?.originCountry || 'US';
      if (destination.country === originCountry) {
        dispatch({
          type: 'SET_TAXES_DUTIES',
          payload: {
            data: {
              success: true,
              taxes: 0,
              duties: 0,
              total: 0,
              isDomestic: true
            }
          }
        });
        return { success: true, taxes: 0, duties: 0, total: 0 };
      }

      // For international orders, calculate taxes and duties
      const result = await calculateTaxesAndDuties(cartItems, destination, shippingCost);

      dispatch({
        type: 'SET_TAXES_DUTIES',
        payload: { data: result }
      });

      return result;
    } catch (error) {
      console.error('Error calculating taxes and duties:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: { error: error.message || 'Failed to calculate taxes and duties' }
      });
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Get the total shipping cost including selected method and taxes/duties
   */
  const getShippingTotal = useCallback(() => {
    let total = 0;

    if (state.selectedShippingMethod) {
      total += state.selectedShippingMethod.price;
    }

    if (state.taxesAndDuties && !state.taxesAndDuties.isDomestic) {
      total += state.taxesAndDuties.total || 0;
    }

    return total;
  }, [state.selectedShippingMethod, state.taxesAndDuties]);

  /**
   * Get breakdown of shipping costs
   */
  const getShippingBreakdown = useCallback(() => {
    const breakdown = {
      shippingCost: state.selectedShippingMethod?.price || 0,
      shippingMethod: state.selectedShippingMethod?.serviceName || 'Not selected',
      taxes: state.taxesAndDuties?.taxes || 0,
      duties: state.taxesAndDuties?.duties || 0,
      isDomestic: state.taxesAndDuties?.isDomestic || false,
      total: getShippingTotal()
    };

    return breakdown;
  }, [state.selectedShippingMethod, state.taxesAndDuties, getShippingTotal]);

  /**
   * Clear all shipping data
   */
  const clearShipping = useCallback(() => {
    dispatch({ type: 'CLEAR_SHIPPING' });
  }, []);

  /**
   * Toggle mock data mode (for development)
   */
  const setUseMockData = useCallback((useMock) => {
    dispatch({
      type: 'SET_USE_MOCK',
      payload: { useMock }
    });
  }, []);

  /**
   * Check if shipping rates need to be refreshed
   */
  const shouldRefreshRates = useCallback(() => {
    if (!state.ratesLastFetched) return true;

    // Refresh rates if they're older than 15 minutes
    const fifteenMinutes = 15 * 60 * 1000;
    const lastFetchTime = new Date(state.ratesLastFetched).getTime();
    const now = new Date().getTime();

    return (now - lastFetchTime) > fifteenMinutes;
  }, [state.ratesLastFetched]);

  const value = {
    // State
    shippingAddress: state.shippingAddress,
    availableRates: state.availableRates,
    selectedShippingMethod: state.selectedShippingMethod,
    taxesAndDuties: state.taxesAndDuties,
    isLoading: state.isLoading,
    error: state.error,
    useMockData: state.useMockData,

    // Actions
    setShippingAddress,
    fetchShippingRates,
    selectShippingMethod,
    fetchTaxesAndDuties,
    getShippingTotal,
    getShippingBreakdown,
    clearShipping,
    setUseMockData,
    shouldRefreshRates
  };

  return (
    <ShippingContext.Provider value={value}>
      {children}
    </ShippingContext.Provider>
  );
};

export const useShipping = () => {
  const context = useContext(ShippingContext);
  if (!context) {
    throw new Error('useShipping must be used within a ShippingProvider');
  }
  return context;
};

export default ShippingContext;
