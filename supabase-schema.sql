-- Replate Database Schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    role VARCHAR(20) NOT NULL CHECK (role IN ('restaurant', 'ngo')),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FoodScans table
CREATE TABLE food_scans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('safe', 'spoiled')),
    ai_confidence DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pickups table
CREATE TABLE pickups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ngo_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ready', 'collected', 'cancelled')),
    location POINT,
    address TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table for chatbot
CREATE TABLE chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_user BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_food_scans_user_id ON food_scans(user_id);
CREATE INDEX idx_food_scans_created_at ON food_scans(created_at);
CREATE INDEX idx_pickups_restaurant_id ON pickups(restaurant_id);
CREATE INDEX idx_pickups_status ON pickups(status);
CREATE INDEX idx_pickups_location ON pickups USING GIST(location);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Food scans policies
CREATE POLICY "Users can view own food scans" ON food_scans
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own food scans" ON food_scans
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Pickups policies
CREATE POLICY "Restaurants can view own pickups" ON pickups
    FOR SELECT USING (auth.uid()::text = restaurant_id::text);

CREATE POLICY "NGOs can view all ready pickups" ON pickups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'ngo'
        )
    );

CREATE POLICY "Restaurants can create pickups" ON pickups
    FOR INSERT WITH CHECK (auth.uid()::text = restaurant_id::text);

CREATE POLICY "NGOs can update pickup status" ON pickups
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'ngo'
        )
    );

-- Chat messages policies
CREATE POLICY "Users can view own chat messages" ON chat_messages
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pickups_updated_at BEFORE UPDATE ON pickups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
