-- Restaurant Management System - MySQL Schema
-- Compatible with Vertigo (MySQL)
-- Drop existing tables if they exist (optional, for testing)

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS tables;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Table: users
-- Description: Stores user accounts (admin, staff, customer)
-- ============================================================
CREATE TABLE users (
  id CHAR(36) NOT NULL COMMENT 'UUID primary key',
  email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email address, unique constraint',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
  full_name VARCHAR(255) NOT NULL COMMENT 'Full name of user',
  phone_number VARCHAR(20) COMMENT 'Phone number, optional',
  role ENUM('admin', 'staff', 'customer') NOT NULL DEFAULT 'customer' COMMENT 'User role',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  PRIMARY KEY (id),
  KEY idx_email (email),
  KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User accounts with role-based access control (RBAC)';

-- ============================================================
-- Table: categories
-- Description: Food/drink categories
-- ============================================================
CREATE TABLE categories (
  id CHAR(36) NOT NULL COMMENT 'UUID primary key',
  name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Category name, unique constraint',
  description TEXT COMMENT 'Category description, optional',
  image_url VARCHAR(500) COMMENT 'URL to category image, optional',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  PRIMARY KEY (id),
  KEY idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Food/drink categories (appetizers, mains, desserts, etc.)';

-- ============================================================
-- Table: menu_items
-- Description: Restaurant menu items with pricing
-- ============================================================
CREATE TABLE menu_items (
  id CHAR(36) NOT NULL COMMENT 'UUID primary key',
  category_id CHAR(36) NOT NULL COMMENT 'Foreign key to categories table',
  name VARCHAR(255) NOT NULL COMMENT 'Menu item name',
  description TEXT COMMENT 'Item description and ingredients, optional',
  price DECIMAL(10, 2) NOT NULL COMMENT 'Item price',
  image_url VARCHAR(500) COMMENT 'URL to item image, optional',
  area VARCHAR(100) COMMENT 'Area/location code, optional',
  is_available BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Availability status',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Featured on homepage or special section',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  PRIMARY KEY (id),
  CONSTRAINT fk_menu_items_category_id FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  KEY idx_category_id (category_id),
  KEY idx_is_available (is_available),
  KEY idx_is_featured (is_featured),
  KEY idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Restaurant menu items with category relationship';

-- ============================================================
-- Table: tables
-- Description: Physical dining tables in restaurant
-- ============================================================
CREATE TABLE tables (
  id CHAR(36) NOT NULL COMMENT 'UUID primary key',
  table_number INT NOT NULL UNIQUE COMMENT 'Physical table number',
  capacity INT NOT NULL COMMENT 'Seating capacity',
  status VARCHAR(50) NOT NULL DEFAULT 'available' COMMENT 'Status: available, occupied, reserved, etc.',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  PRIMARY KEY (id),
  UNIQUE KEY unique_table_number (table_number),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Physical dining tables with status tracking';

-- ============================================================
-- Table: reservations
-- Description: Dining table reservations
-- ============================================================
CREATE TABLE reservations (
  id CHAR(36) NOT NULL COMMENT 'UUID primary key',
  user_id CHAR(36) COMMENT 'Foreign key to users table, nullable for guest reservations',
  table_id CHAR(36) COMMENT 'Foreign key to tables table, nullable if not assigned yet',
  reservation_time DATETIME NOT NULL COMMENT 'Reservation date and time',
  guest_count INT NOT NULL COMMENT 'Number of guests',
  guest_name VARCHAR(255) NOT NULL COMMENT 'Guest name (for guest reservations or reference)',
  guest_phone VARCHAR(20) NOT NULL COMMENT 'Guest phone number for contact',
  notes TEXT COMMENT 'Special requests or notes, optional',
  status VARCHAR(50) NOT NULL DEFAULT 'pending' COMMENT 'Status: pending, confirmed, completed, cancelled',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  PRIMARY KEY (id),
  CONSTRAINT fk_reservations_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_reservations_table_id FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
  KEY idx_user_id (user_id),
  KEY idx_table_id (table_id),
  KEY idx_reservation_time (reservation_time),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Dining table reservations (supports guest and authenticated user reservations)';

-- ============================================================
-- Table: orders
-- Description: Customer orders
-- ============================================================
CREATE TABLE orders (
  id CHAR(36) NOT NULL COMMENT 'UUID primary key',
  user_id CHAR(36) COMMENT 'Foreign key to users table, nullable for walk-in customers',
  table_id CHAR(36) COMMENT 'Foreign key to tables table, nullable for takeout orders',
  total_amount DECIMAL(10, 2) NOT NULL COMMENT 'Total order amount',
  order_status VARCHAR(50) NOT NULL DEFAULT 'pending' COMMENT 'Status: pending, preparing, ready, served, completed, cancelled',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid' COMMENT 'Payment status: unpaid, paid, refunded',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Order creation timestamp',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  PRIMARY KEY (id),
  CONSTRAINT fk_orders_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_table_id FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
  KEY idx_user_id (user_id),
  KEY idx_table_id (table_id),
  KEY idx_order_status (order_status),
  KEY idx_payment_status (payment_status),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Customer orders with tracking of order and payment status';

-- ============================================================
-- Table: order_items
-- Description: Line items in orders
-- ============================================================
CREATE TABLE order_items (
  id CHAR(36) NOT NULL COMMENT 'UUID primary key',
  order_id CHAR(36) NOT NULL COMMENT 'Foreign key to orders table',
  menu_item_id CHAR(36) NOT NULL COMMENT 'Foreign key to menu_items table',
  quantity INT NOT NULL COMMENT 'Quantity ordered',
  unit_price DECIMAL(10, 2) NOT NULL COMMENT 'Price per unit at time of order',
  notes VARCHAR(500) COMMENT 'Special instructions for this item, optional',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  
  PRIMARY KEY (id),
  CONSTRAINT fk_order_items_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_menu_item_id FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT,
  KEY idx_order_id (order_id),
  KEY idx_menu_item_id (menu_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Line items for orders with menu item references and special instructions';

-- ============================================================
-- Indexes for better query performance
-- ============================================================
CREATE INDEX idx_orders_created_at_status ON orders(created_at DESC, order_status);
CREATE INDEX idx_reservations_time_status ON reservations(reservation_time, status);
CREATE INDEX idx_menu_items_search ON menu_items(name, is_available, category_id);

-- ============================================================
-- Sample data for testing (optional)
-- ============================================================

-- Insert sample admin user (password: admin123, bcrypt hash)
INSERT INTO users (id, email, password_hash, full_name, phone_number, role)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'admin@restaurant.com',
  '$2a$10$8ug2rwfPD3N8K9HVSE3pnuJKKGJV5Kt.JowFQkqVpYmBSLGGzWzTK',
  'Admin User',
  '+1234567890',
  'admin'
);

-- Insert sample categories


-- Insert sample tables
INSERT INTO tables (id, table_number, capacity, status, created_at, updated_at) VALUES
('0274850e-9fc9-4d46-ac7e-867ca025d82f', 'OUT-03', 4, 'available', '2026-03-17 04:15:33', '2026-03-17 04:15:33'),
('153a8a78-ca04-472e-841e-c7babfceafdb', 'T1-01', 2, 'available', '2026-03-17 04:15:33', '2026-03-17 04:15:33'),
('23920dc7-3683-4970-b9b8-092f5f6afc14', 'OUT-02', 4, 'available', '2026-03-17 04:15:33', '2026-03-17 04:15:33'),
('8f825124-11ae-4db4-b06d-b69413e2a105', 'VIP-02', 12, 'available', '2026-03-17 04:15:33', '2026-03-17 04:15:33'),
('9825957f-41ce-4c3b-8b93-7f0bb1dc2007', 'VIP-01', 8, 'available', '2026-03-17 04:15:33', '2026-03-17 04:15:33'),
('9da36c8d-e896-4310-b0dc-8c75dd64b5e3', 'T1-04', 4, 'available', '2026-03-17 04:15:33', '2026-03-17 04:15:33'),
('a439ae88-fa40-435a-9cc8-e0037fbf07e5', 'T1-02', 2, 'available', '2026-03-17 04:15:33', '2026-03-17 04:15:33'),
('a79baac5-0b9d-44f1-815d-5585ba7c6bae', 'OUT-01', 2, 'available', '2026-03-17 04:15:33', '2026-03-17 04:15:33'),
('a8bf8ae8-943e-47cf-8269-6cbc199b2676', 'T1-05', 6, 'available', '2026-03-17 04:15:33', '2026-03-17 04:15:33'),
('b30ff330-702c-4da5-892a-d5ebb1b3a970', 'T1-03', 4, 'available', '2026-03-17 04:15:33', '2026-03-17 04:15:33');

-- Insert sample menu items

-- ============================================================
-- End of schema

