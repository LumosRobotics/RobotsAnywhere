import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
    
    // Check if user needs email confirmation
    if (!data.user.email_confirmed_at && !data.session) {
      console.log('User registration successful, but email confirmation required');
      dispatch({ type: 'REGISTER_SUCCESS', payload: { 
        user: {
          id: data.user.id,
          email: data.user.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          address: userData.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'USA'
          },
          createdAt: data.user.created_at,
          emailConfirmed: false
        }
      }});
      return { 
        success: true, 
        message: 'Account created! Please check your email to confirm your account.' 
      };
    }
    
    // If user is immediately confirmed, create profile
    try {
      await createUserProfile(data.user.id, userData);
    } catch (profileError) {
      console.error('Failed to create profile:', profileError);
      // Still consider registration successful, profile can be created later
    }
    
    const userWithProfile = {
      id: data.user.id,
      email: data.user.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      address: userData.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      createdAt: data.user.created_at
    };
    
    dispatch({ type: 'REGISTER_SUCCESS', payload: { user: userWithProfile } });
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'LOGOUT' });
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
    
    // Create order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: state.user.id,
        total: orderData.total,
        status: 'pending',
        shipping_address: state.user.address
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
    
    return {
      ...order,
      items: orderData.items
    };
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