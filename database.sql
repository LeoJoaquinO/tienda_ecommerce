-- This script initializes the database for the Joya store.
-- It creates the 'products' table and inserts some sample data.

-- Drop the table if it already exists to start fresh.
DROP TABLE IF EXISTS products;

-- Create the 'products' table.
CREATE TABLE products (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10, 2) NOT NULL,
  `salePrice` DECIMAL(10, 2),
  `image` VARCHAR(255) NOT NULL,
  `aiHint` VARCHAR(100),
  `category` VARCHAR(100),
  `stock` INT NOT NULL DEFAULT 0,
  `featured` BOOLEAN DEFAULT FALSE
);

-- Insert sample data into the 'products' table.
INSERT INTO `products` (`name`, `description`, `price`, `salePrice`, `image`, `aiHint`, `category`, `stock`, `featured`) VALUES
('Vela Aromática de Soja', 'Vela artesanal de cera de soja con fragancia a lavanda y romero. Perfecta para crear un ambiente relajante.', 3500.00, 2990.00, 'https://placehold.co/600x600', 'scented candle', 'Hogar', 25, TRUE),
('Taza de Cerámica Hecha a Mano', 'Taza de cerámica con un diseño único pintado a mano. Ideal para tu café de la mañana.', 4200.00, NULL, 'https://placehold.co/600x600', 'ceramic mug', 'Cocina', 15, TRUE),
('Cuaderno de Tapa Dura "Ideas"', 'Un cuaderno elegante con 100 hojas punteadas para que anotes todas tus ideas. Tapa dura y cierre elástico.', 2800.00, NULL, 'https://placehold.co/600x600', 'hardcover notebook', 'Papelería', 40, TRUE),
('Maceta de Terracota Minimalista', 'Dale un toque de naturaleza a tu espacio con esta maceta de diseño simple y elegante.', 3900.00, 3500.00, 'https://placehold.co/600x600', 'plant pot', 'Hogar', 20, FALSE),
('Bolsa de Tela "Eco-Friendly"', 'Bolsa de tela reutilizable con un diseño moderno. Ayuda al planeta con estilo.', 2500.00, NULL, 'https://placehold.co/600x600', 'tote bag', 'Accesorios', 50, FALSE),
('Set de Posavasos de Madera', 'Protege tus superficies con este set de 4 posavasos de madera de acacia.', 3100.00, NULL, 'https://placehold.co/600x600', 'wood coasters', 'Cocina', 18, FALSE),
('Lámina Decorativa "Abstracto"', 'Lámina para enmarcar con una composición abstracta en tonos cálidos. Medidas: 30x40cm.', 2200.00, 1900.00, 'https://placehold.co/600x600', 'abstract art', 'Decoración', 30, FALSE),
('Infusor de Té de Acero Inoxidable', 'Disfruta de tu té en hebras favorito con este práctico y duradero infusor de acero.', 1800.00, NULL, 'https://placehold.co/600x600', 'tea infuser', 'Cocina', 28, FALSE);

