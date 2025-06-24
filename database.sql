-- This script sets up the `products` table for the Joya store.
-- You can run this script on your MySQL server to create the necessary table structure.
-- Example command: `mysql -u your_user -p your_database < database.sql`

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `salePrice` decimal(10,2) DEFAULT NULL,
  `image` varchar(2048) NOT NULL,
  `category` varchar(100) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT '0',
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `aiHint` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- You can optionally add some initial products here if you want.
-- For example:
--
-- INSERT INTO `products` (`name`, `description`, `price`, `salePrice`, `image`, `category`, `stock`, `featured`, `aiHint`) VALUES
-- ('Anillo de Bodas Clásico', 'Un elegante y atemporal anillo de bodas de oro, perfecto para simbolizar vuestro amor eterno.', 750.00, 699.00, 'https://cdn.pixabay.com/photo/2018/08/16/19/56/wedding-rings-3611277_640.jpg', 'Anillos', 15, 1, 'gold rings'),
-- ('Alianza de Compromiso', 'Una hermosa alianza de oro blanco para un compromiso inolvidable.', 980.00, NULL, 'https://cdn.pixabay.com/photo/2018/08/16/19/56/wedding-rings-3611277_640.jpg', 'Anillos', 10, 1, 'gold rings');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
