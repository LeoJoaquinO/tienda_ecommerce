
-- This file contains the SQL schema for the database.
-- Use this file to set up your database for production deployment.

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `image` VARCHAR(1024) NOT NULL,
  `category` VARCHAR(255) NOT NULL,
  `stock` INT NOT NULL,
  `featured` BOOLEAN DEFAULT FALSE,
  `aiHint` VARCHAR(255),
  `discountPercentage` DECIMAL(5, 2),
  `offerStartDate` DATETIME,
  `offerEndDate` DATETIME
);

CREATE TABLE IF NOT EXISTS `coupons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(255) NOT NULL UNIQUE,
  `discount_type` ENUM('percentage', 'fixed') NOT NULL,
  `discount_value` DECIMAL(10, 2) NOT NULL,
  `expiry_date` DATETIME,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: In a real production environment, you would add sample data
-- here or use an admin interface to populate your tables.
-- Example of inserting a product:
-- INSERT INTO `products` (name, description, price, image, category, stock, featured) VALUES 
-- ('Aura de Rosas', 'Una fragancia floral y romántica...', 120.00, 'https://example.com/image.jpg', 'Floral', 25, TRUE);

-- Example of inserting a coupon:
-- INSERT INTO `coupons` (code, discount_type, discount_value, expiry_date) VALUES 
-- ('SUMMER20', 'percentage', 20.00, '2024-09-01 23:59:59');

