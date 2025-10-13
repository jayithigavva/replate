-- Fix for Row Level Security - Add missing INSERT policy for users table
-- Run this in your Supabase SQL Editor

-- Add policy to allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile during signup" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- This allows the app to create a user record when someone signs up



