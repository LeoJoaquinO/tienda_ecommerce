-- This script is designed to be idempotent. 
-- You can run it multiple times without causing errors.

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(255),
    price NUMERIC(10, 2) NOT NULL,
    images TEXT[] NOT NULL,
    category VARCHAR(100),
    stock INTEGER NOT NULL,
    ai_hint VARCHAR(255),
    featured BOOLEAN DEFAULT FALSE,
    discount_percentage NUMERIC(5, 2),
    offer_start_date TIMESTAMP WITH TIME ZONE,
    offer_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- ADDED THIS LINE
);

CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
    discount_value NUMERIC(10, 2) NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    total NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'pending', 'paid', 'shipped', 'cancelled'
    items JSONB NOT NULL,
    coupon_code VARCHAR(50),
    discount_amount NUMERIC(10, 2),
    payment_id VARCHAR(255),
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add created_at column to products table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;
