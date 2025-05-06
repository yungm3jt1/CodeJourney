-- Create database
CREATE DATABASE IF NOT EXISTS auth_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auth_system;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    token VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL,
    last_login DATETIME DEFAULT NULL,
    active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- Create a reset_tokens table for password resets (optional)
CREATE TABLE IF NOT EXISTS reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Optional: Create user_logs table for login history
