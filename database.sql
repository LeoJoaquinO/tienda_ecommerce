
-- This file contains the SQL commands to create the database structure for your store.
--
-- How to use this file:
-- 1. Vercel Deployment: Copy the entire content of this file. Go to your Vercel project's "Storage" tab, select your Postgres database, go to the "Query" tab, and paste this content. Click "Run".
-- 2. VPS Deployment (MySQL): Run the command `mysql -h your_host -u your_user -p your_database < database.sql` from your server's command line.

-- Create Products Table
CREATE TABLE products (
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
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Coupons Table
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    expiry_date DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders Table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'paid', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
    payment_id VARCHAR(255),
    coupon_code VARCHAR(50),
    discount_amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Order Items Table (to link products to orders)
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- Price at the time of purchase
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Create Subscribers Table
CREATE TABLE subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


    