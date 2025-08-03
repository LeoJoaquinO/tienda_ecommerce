-- This script contains the SQL command to create the `products` table.
-- You can run this command in your database management tool (like phpMyAdmin, DBeaver, or the Vercel Postgres query editor)
-- to set up the necessary table structure for the application.

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(2048) NOT NULL,
    category VARCHAR(255) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    aiHint VARCHAR(255),
    discountPercentage DECIMAL(5, 2),
    offerStartDate DATETIME,
    offerEndDate DATETIME
);
