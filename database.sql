-- Joya Store - Database Schema
-- This script contains the CREATE TABLE statements for all necessary tables.
-- It is designed to be compatible with both MySQL and PostgreSQL.

--
-- Table structure for table `products`
--
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `shortDescription` VARCHAR(255) NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `category` VARCHAR(100),
  `images` TEXT,
  `featured` BOOLEAN DEFAULT FALSE,
  `aiHint` VARCHAR(255) NULL,
  `discountPercentage` INT NULL,
  `offerStartDate` DATETIME NULL,
  `offerEndDate` DATETIME NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--
-- Table structure for table `coupons`
--
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `discount_type` ENUM('percentage', 'fixed') NOT NULL,
  `discount_value` DECIMAL(10, 2) NOT NULL,
  `expiry_date` DATETIME NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--
-- Table structure for table `orders`
--
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_name` VARCHAR(255),
  `customer_email` VARCHAR(255),
  `total` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('pending', 'paid', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  `coupon_code` VARCHAR(50) NULL,
  `discount_amount` DECIMAL(10, 2) DEFAULT 0,
  `payment_id` VARCHAR(255) NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--
-- Table structure for table `order_items`
--
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT
);
