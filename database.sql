CREATE DATABASE IF NOT EXISTS ga_car_universe;
USE ga_car_universe;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(15),
    name VARCHAR(100),
    door_no VARCHAR(50),
    street VARCHAR(255),
    area VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10)
);

-- Products table (updated with specifications)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_name VARCHAR(100) NOT NULL,
    price INT NOT NULL DEFAULT 0,
    category VARCHAR(100),
    stock INT NOT NULL DEFAULT 0,
    image_path VARCHAR(255),
    description TEXT,
    scale VARCHAR(20) DEFAULT '1:36',
    brand VARCHAR(50) DEFAULT 'Generic',
    material VARCHAR(50) DEFAULT 'Diecast Metal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY user_product (username, product_id)
);

-- Order Master table
CREATE TABLE IF NOT EXISTS order_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    whatsapp VARCHAR(15),
    name VARCHAR(100),
    door_no VARCHAR(50),
    street VARCHAR(255),
    area VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Payment, Processing, Shipping, Delivered
    courier_name VARCHAR(100),
    tracking_id VARCHAR(100),
    FOREIGN KEY (username) REFERENCES users(username)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price INT NOT NULL,
    image_path VARCHAR(255),
    FOREIGN KEY (order_id) REFERENCES order_master(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY user_wishlist (username, product_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    username VARCHAR(100) NOT NULL,
    rating INT NOT NULL DEFAULT 5,
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);