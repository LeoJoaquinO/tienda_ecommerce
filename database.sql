-- SQL script for creating the necessary tables for the Joya store.
-- This script is designed for MySQL.

-- For Vercel Postgres, you might need to make minor syntax adjustments
-- (e.g., SERIAL for AUTO_INCREMENT, and TIMESTAMPTZ for DATETIME).

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    shortDescription VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    images TEXT, -- Comma-separated list of image URLs
    category VARCHAR(100) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    aiHint VARCHAR(255),
    discountPercentage DECIMAL(5, 2),
    offerStartDate DATETIME,
    offerEndDate DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    expiry_date DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    shipping_address VARCHAR(255) NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'paid', 'failed', 'cancelled', 'shipped', 'delivered') NOT NULL DEFAULT 'pending',
    coupon_code VARCHAR(50),
    discount_amount DECIMAL(10, 2),
    payment_id VARCHAR(255), -- To store the Mercado Pago payment ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT -- Prevent deleting a product that is part of an order
);

CREATE TABLE IF NOT EXISTS subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
