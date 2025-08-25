# Upgrade to Real Authentication System

## Quick Start with Supabase (Recommended)

### Step 1: Setup Supabase Project
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Note your project URL and anon key

### Step 2: Install Dependencies
```bash
npm install @supabase/supabase-js
```

### Step 3: Create Supabase Client
Create `src/lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 4: Create Database Tables
Run these SQL commands in Supabase SQL Editor:

```sql
-- Users table (automatically created by Supabase Auth)
-- Add custom profile fields
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  address_country TEXT DEFAULT 'USA',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_data JSONB NOT NULL, -- Store full product info
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own data)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert own order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
```

### Step 5: Update UserContext
Replace the mock authentication in `src/contexts/UserContext.jsx`:

```javascript
import { supabase } from '../lib/supabase'

// Replace login function:
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
    ...profile
  };
  
  dispatch({ type: 'LOGIN_SUCCESS', payload: { user: userData } });
  return { success: true };
};

// Replace register function:
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
  
  // Create user profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone
    });
  
  if (profileError) {
    console.error('Profile creation error:', profileError);
  }
  
  const userWithProfile = {
    id: data.user.id,
    email: data.user.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone
  };
  
  dispatch({ type: 'REGISTER_SUCCESS', payload: { user: userWithProfile } });
  return { success: true };
};
```

### Step 6: Implement Real Order Storage
Update the `addOrder` function:

```javascript
const addOrder = async (orderData) => {
  if (!state.user) return;
  
  // Create order
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
  
  return order;
};
```

## Alternative: Firebase Setup

### Step 1: Firebase Project Setup
```bash
npm install firebase
```

### Step 2: Firebase Config
Create `src/lib/firebase.js`:
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your config from Firebase Console
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Step 3: Update UserContext for Firebase
```javascript
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// Implementation similar to Supabase but using Firebase APIs
```

## Production Checklist
- [ ] Environment variables for API keys
- [ ] Error logging (Sentry, LogRocket)
- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Rate limiting for auth endpoints
- [ ] User session management
- [ ] Data backup strategy
- [ ] GDPR compliance (data export/deletion)

## Security Best Practices
- [ ] Use HTTPS in production
- [ ] Implement proper CORS policies
- [ ] Add input validation and sanitization
- [ ] Set up monitoring for suspicious activity
- [ ] Regular security updates
- [ ] Implement proper error handling (don't leak sensitive info)