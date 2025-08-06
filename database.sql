
-- This script is for PostgreSQL and is designed to be run in the Vercel Postgres (Neon) query editor.
-- It creates the necessary tables for the Joya e-commerce application.

-- Drop tables if they exist to allow for a clean re-run of the script.
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- Create the products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    images TEXT[] NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    ai_hint VARCHAR(255),
    discount_percentage DECIMAL(5, 2),
    offer_start_date TIMESTAMP WITH TIME ZONE,
    offer_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the coupons table
CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'pending', 'paid', 'failed', 'cancelled', etc.
    items JSONB NOT NULL,
    coupon_code VARCHAR(50),
    discount_amount DECIMAL(10, 2),
    payment_id VARCHAR(255),
    shipping_address TEXT,
    shipping_city VARCHAR(255),
    shipping_postal_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add some indexes for better query performance
CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_featured ON products (featured);
CREATE INDEX idx_coupons_code ON coupons (code);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_customer_email ON orders (customer_email);
