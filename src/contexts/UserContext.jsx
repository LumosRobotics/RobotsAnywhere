import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { createShipment } from '../services/easyship';

const UserContext = createContext();

const userReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS': {
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    }
    
    case 'LOGIN_FAILURE': {
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      };
    }
    
    case 'LOGOUT': {
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    }
    
    case 'REGISTER_SUCCESS': {
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    }
    
    case 'REGISTER_FAILURE': {
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      };
    }
    
    case 'UPDATE_PROFILE': {
      return {
        ...state,
        user: { ...state.user, ...action.payload.updates },
        error: null
      };
    }
    
    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload.isLoading
      };
    }
    
    case 'CLEAR_ERROR': {
      return {
        ...state,
        error: null
      };
    }
    
    case 'LOAD_USER': {
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isLoading: false
      };
    }
    
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};


export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Helper function to create user profile
  const createUserProfile = async (userId, userData) => {
    console.log('Creating profile for user:', userId, 'with data:', userData);
    
    // First check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (existingProfile) {
      console.log('Profile already exists for user:', userId);
      return;
    }
    
    const profileParams = {
      user_id: userId,
      first_name: userData.firstName || '',
      last_name: userData.lastName || '',
      phone: userData.phone || '',
      address_street: userData.address?.street || '',
      address_city: userData.address?.city || '',
      address_state: userData.address?.state || '',
      address_zip: userData.address?.zipCode || '',
      address_country: userData.address?.country || 'USA'
    };
    
    console.log('Profile parameters being sent:', profileParams);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        phone: userData.phone || '',
        address_street: userData.address?.street || '',
        address_city: userData.address?.city || '',
        address_state: userData.address?.state || '',
        address_zip: userData.address?.zipCode || '',
        address_country: userData.address?.country || 'USA'
      })
      .select();
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    } else {
      console.log('Profile created successfully:', profileData);
    }
  };

  // Load user from Supabase session on mount
  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error loading session:', error);
        dispatch({ type: 'LOAD_USER', payload: { user: null } });
        return;
      }
      
      if (session?.user) {
        // Fetch user profile from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        const userData = {
          id: session.user.id,
          email: session.user.email,
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          phone: profile?.phone || '',
          address: {
            street: profile?.address_street || '',
            city: profile?.address_city || '',
            state: profile?.address_state || '',
            zipCode: profile?.address_zip || '',
            country: profile?.address_country || 'USA'
          },
          createdAt: session.user.created_at
        };
        
        dispatch({ type: 'LOAD_USER', payload: { user: userData } });
      } else {
        dispatch({ type: 'LOAD_USER', payload: { user: null } });
      }
    };
    
    getSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        dispatch({ type: 'LOGOUT' });
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Check if profile exists, create if it doesn't
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (!profile) {
          console.log('No profile found for confirmed user, creating...');
          // This will only work if we have the user data stored somewhere
          // For now, create basic profile
          try {
            await createUserProfile(session.user.id, {
              firstName: '',
              lastName: '',
              phone: '',
              address: { street: '', city: '', state: '', zipCode: '', country: 'USA' }
            });
          } catch (error) {
            console.error('Could not create profile for confirmed user:', error);
          }
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);


  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: { error: error.message } });
      return { success: false, error: error.message };
    }
    
    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    const userData = {
      id: data.user.id,
      email: data.user.email,
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      phone: profile?.phone || '',
      address: {
        street: profile?.address_street || '',
        city: profile?.address_city || '',
        state: profile?.address_state || '',
        zipCode: profile?.address_zip || '',
        country: profile?.address_country || 'USA'
      },
      createdAt: data.user.created_at
    };
    
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: userData } });
    return { success: true };
  };

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
    
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password
    });
    
    if (error) {
      dispatch({ type: 'REGISTER_FAILURE', payload: { error: error.message } });
      return { success: false, error: error.message };
    }
    
    // Always require email confirmation - don't auto-login
    console.log('User registration successful, email confirmation required');
    
    // Store user data temporarily for profile creation after confirmation
    try {
      await createUserProfile(data.user.id, userData);
      console.log('Profile created for unconfirmed user');
    } catch (profileError) {
      console.error('Failed to create profile:', profileError);
      // Continue anyway, profile can be created when user confirms
    }
    
    // Don't set user as authenticated, just clear loading state
    dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
    
    return { 
      success: true, 
      message: 'An email has been sent to the email address you provided. Please confirm your email to complete registration.',
      requiresConfirmation: true
    };
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
      }
      // Let the onAuthStateChange listener handle the state update
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      // Force local logout if Supabase call fails
      dispatch({ type: 'LOGOUT' });
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates) => {
    if (!state.user) return { success: false, error: 'No user logged in' };
    
    // Update profile in Supabase
    const profileUpdates = {};
    
    if (updates.firstName) profileUpdates.first_name = updates.firstName;
    if (updates.lastName) profileUpdates.last_name = updates.lastName;
    if (updates.phone) profileUpdates.phone = updates.phone;
    if (updates.address) {
      if (updates.address.street) profileUpdates.address_street = updates.address.street;
      if (updates.address.city) profileUpdates.address_city = updates.address.city;
      if (updates.address.state) profileUpdates.address_state = updates.address.state;
      if (updates.address.zipCode) profileUpdates.address_zip = updates.address.zipCode;
      if (updates.address.country) profileUpdates.address_country = updates.address.country;
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', state.user.id);
    
    if (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
    
    dispatch({ type: 'UPDATE_PROFILE', payload: { updates } });
    return { success: true };
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const addOrder = async (orderData) => {
    if (!state.user) return null;

    try {
      // Create order in Supabase with shipping information
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: state.user.id,
          subtotal: orderData.subtotal,
          shipping_cost: orderData.shippingCost || 0,
          taxes_duties: orderData.taxesDuties || 0,
          total: orderData.total,
          status: 'pending',
          shipping_address: orderData.shippingAddress || state.user.address,
          shipping_method: orderData.shippingMethod || null,
          shipment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        return null;
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_data: item.product,
        quantity: item.quantity,
        price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
      }

      // Create shipment with EasyShip if shipping method is selected
      if (orderData.shippingMethod && orderData.shippingAddress) {
        try {
          const shipmentData = {
            orderId: order.id,
            courier: orderData.shippingMethod.courierData || {
              courier_id: orderData.shippingMethod.id,
              courier_name: orderData.shippingMethod.name
            },
            recipient: {
              name: `${state.user.firstName} ${state.user.lastName}`,
              email: state.user.email,
              phone: state.user.phone || '',
              address: orderData.shippingAddress
            },
            items: orderData.items
          };

          const shipmentResult = await createShipment(shipmentData);

          if (shipmentResult.success) {
            // Update order with shipment information
            const { error: updateError } = await supabase
              .from('orders')
              .update({
                shipment_id: shipmentResult.shipment.id,
                tracking_number: shipmentResult.shipment.trackingNumber,
                tracking_url: shipmentResult.shipment.trackingNumber
                  ? `https://track.easyship.com/${shipmentResult.shipment.id}`
                  : null,
                label_url: shipmentResult.shipment.labelUrl,
                courier_name: shipmentResult.shipment.courierName,
                estimated_delivery_date: shipmentResult.shipment.estimatedDelivery,
                shipment_status: 'created'
              })
              .eq('id', order.id);

            if (updateError) {
              console.error('Failed to update order with shipment info:', updateError);
            }
          } else {
            console.error('Shipment creation failed:', shipmentResult.error);
            // Order still created, but shipment creation failed
            // Could notify admin or retry later
          }
        } catch (shipmentError) {
          console.error('Error creating shipment:', shipmentError);
          // Order still valid, shipment can be created manually later
        }
      }

      return {
        ...order,
        items: orderData.items
      };
    } catch (error) {
      console.error('Error in addOrder:', error);
      return null;
    }
  };

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    addOrder
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};