-- Fix for Row Level Security policy issue during user registration
-- Run these commands in your Supabase SQL Editor

-- Drop the existing INSERT policy for profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a more permissive INSERT policy that allows profile creation during registration
-- This allows INSERT when the user ID matches OR when inserting during the signup process
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT 
WITH CHECK (
    auth.uid() = id OR 
    auth.jwt() ->> 'sub' = id::text
);

-- Alternative approach: Create a database function to handle profile creation
-- This function runs with elevated privileges and can bypass RLS
CREATE OR REPLACE FUNCTION create_user_profile(
    user_id uuid,
    first_name text DEFAULT '',
    last_name text DEFAULT '',
    phone text DEFAULT '',
    address_street text DEFAULT '',
    address_city text DEFAULT '',
    address_state text DEFAULT '',
    address_zip text DEFAULT '',
    address_country text DEFAULT 'USA'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO profiles (
        id, first_name, last_name, phone, 
        address_street, address_city, address_state, 
        address_zip, address_country
    ) VALUES (
        user_id, first_name, last_name, phone,
        address_street, address_city, address_state,
        address_zip, address_country
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile(uuid, text, text, text, text, text, text, text, text) TO authenticated;