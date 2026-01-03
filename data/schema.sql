CREATE DATABASE IF NOT EXISTS egg_db;
USE egg_db;


-- Users Table
-- Uses CHAR(36) for UUIDs to ensure globally unique identifiers
CREATE TABLE users (
    id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Stores hashed password
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes Table
-- Stores recipe details, linked to the user who created it
CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE, -- URL-friendly identifier (e.g., 'boiled-egg')
    name VARCHAR(100) NOT NULL,
    is_shared BOOLEAN DEFAULT FALSE, -- TRUE = Listed in 'User Recipes Tab', FALSE = Listed in 'Home Menu'
    image_path VARCHAR(255), -- Path to the uploaded image file
    ingredients JSON, -- Stores ingredients list as a JSON array
    instructions JSON, -- Stores steps as a JSON array
    animation VARCHAR(100), -- Path to the animation HTML file
    losing_minute INT DEFAULT 0, -- Minute mark for the 'game' aspect
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Stats Table
-- Tracks every time a user cooks (or burns) an egg. 
-- This data is used to calculate stats and generate the leaderboard.
CREATE TABLE stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    recipe_id INT NOT NULL,
    outcome ENUM('cooked', 'burned') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Leaderboard View
-- Aggregates cooking history to show total cooked and burned eggs per user
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    u.username,
    u.id AS user_id,
    COUNT(CASE WHEN ch.outcome = 'cooked' THEN 1 END) AS total_cooked,
    COUNT(CASE WHEN ch.outcome = 'burned' THEN 1 END) AS total_burned
FROM users u
LEFT JOIN stats ch ON u.id = ch.user_id
GROUP BY u.id, u.username
ORDER BY total_cooked DESC;
