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
-- Insert statements for existing users from users.json
-- Generated/Migrated on 2026-01-03T09:09:30.313Z

INSERT INTO users (id, username, email, password) VALUES ('5af9e330-b8d5-4b78-946f-79a97086bdc6', 'wadood', 'wamosalh@gmail.com', '$2b$10$la7AZ1is/EDpGbndrkUOf.3wb0RlRAjc7v4mRrOIf79yug0tHrpbm');
INSERT INTO users (id, username, email, password) VALUES ('5a7ce1f4-f945-4e13-b4a8-ea4e158db34f', 'the blue jin', 'wma603262@Gu.edu.eg', '$2b$10$5PT5mALvgwM4YP4XjVggIOSHOFyUHGs9TQY3ZiwKzH6tLapXwFSia');
INSERT INTO users (id, username, email, password) VALUES ('7129bf5e-28c8-471d-ba51-004b34977954', 'someone', 'wadood@something.com', '$2b$10$XMngUr/tvd3Y.j/GJO17PuVDKmBi3pG2U9CaL9CcjsY9LoE2x7.zS');
INSERT INTO users (id, username, email, password) VALUES ('82707fb8-f6eb-421f-ae8d-52b18a9ae7c5', 'tf3alek', 'tf3alek@whatever.com', '$2b$10$urDK0OA6HFWPgZ9/voseQOpYt9REcPP5Skg7V5IF5Yo8ClDSwaIq2');
INSERT INTO users (id, username, email, password) VALUES ('b0ada832-f96c-47e7-842f-29200a8585a9', 'wsaleh1', 'wsaleh1@asu.edu', '$2b$10$1Azey6RdBpzQ1hSTreTSdu6jJGqJVebNM42ROnoh4jmaLas12COYC');
INSERT INTO users (id, username, email, password) VALUES ('c76eae29-11ce-45ab-9bbf-7435374e60d1', 'Wren', 'bestt1711@gmail.com', '$2b$10$LEkfO9ged6/Q.RhZ0/S9huCRTYBsDvF.mUEvR7AGinofXmpZjHCL.');

-- Default Recipes for Migrated Users
-- Recipes for User 5af9e330-b8d5-4b78-946f-79a97086bdc6
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('5af9e330-b8d5-4b78-946f-79a97086bdc6', 'boiled-5af9e330-b8d5-4b78-946f-79a97086bdc6', 'Boiled Egg', '/boiled.png', '["1 egg", "Water", "Salt (optional)"]', '["Place the egg in a saucepan and cover it with cold water.", "Bring the water to a boil over medium-high heat.", "Once boiling, reduce the heat to low and let it simmer for 9-12 minutes, depending on your desired level of doneness.", "Remove the egg from the hot water and place it in a bowl of ice water to cool for a few minutes.", "Peel the egg and enjoy!"]', 'boiling_egg.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('5af9e330-b8d5-4b78-946f-79a97086bdc6', 'sunny-side-5af9e330-b8d5-4b78-946f-79a97086bdc6', 'Sunny Side Up Egg', '/sunnysideup.png', '["1 egg", "Butter", "Salt and pepper to taste"]', '["Heat a non-stick skillet over medium heat and add butter.", "Crack the egg into the skillet and cook until the whites are set but the yolk remains runny.", "Season with salt and pepper.", "Slide onto a plate and serve immediately."]', 'sunny_side_up_egg.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('5af9e330-b8d5-4b78-946f-79a97086bdc6', 'omelet-5af9e330-b8d5-4b78-946f-79a97086bdc6', 'Omelet', '/omelet.png', '["2 eggs", "Salt and pepper to taste", "Butter or oil", "Cheese (optional)", "Vegetables (optional)"]', '["In a bowl, whisk the eggs with salt and pepper.", "Heat butter or oil in a skillet over medium heat.", "Pour the egg mixture into the skillet and cook until the edges start to set.", "Add cheese and vegetables if desired.", "Fold the omelet in half and cook for another minute until fully set.", "Slide onto a plate and serve hot."]', 'omelet.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('5af9e330-b8d5-4b78-946f-79a97086bdc6', 'scrambled-5af9e330-b8d5-4b78-946f-79a97086bdc6', 'Scrambled Eggs', '/scrumbeled.png', '["2 eggs", "Salt and pepper to taste", "Butter or oil", "Milk or cream (optional)"]', '["In a bowl, whisk the eggs with salt, pepper, and a splash of milk or cream if desired.", "Heat butter or oil in a skillet over medium heat.", "Pour the egg mixture into the skillet.", "Gently stir the eggs with a spatula, pushing them from the edges to the center as they cook.", "Continue cooking until the eggs are softly set and slightly runny in places.", "Remove from heat and serve immediately."]', 'scrambled_eggs.html', 1);

-- Recipes for User 5a7ce1f4-f945-4e13-b4a8-ea4e158db34f
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('5a7ce1f4-f945-4e13-b4a8-ea4e158db34f', 'boiled-5a7ce1f4-f945-4e13-b4a8-ea4e158db34f', 'Boiled Egg', '/boiled.png', '["1 egg", "Water", "Salt (optional)"]', '["Place the egg in a saucepan and cover it with cold water.", "Bring the water to a boil over medium-high heat.", "Once boiling, reduce the heat to low and let it simmer for 9-12 minutes, depending on your desired level of doneness.", "Remove the egg from the hot water and place it in a bowl of ice water to cool for a few minutes.", "Peel the egg and enjoy!"]', 'boiling_egg.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('5a7ce1f4-f945-4e13-b4a8-ea4e158db34f', 'sunny-side-5a7ce1f4-f945-4e13-b4a8-ea4e158db34f', 'Sunny Side Up Egg', '/sunnysideup.png', '["1 egg", "Butter", "Salt and pepper to taste"]', '["Heat a non-stick skillet over medium heat and add butter.", "Crack the egg into the skillet and cook until the whites are set but the yolk remains runny.", "Season with salt and pepper.", "Slide onto a plate and serve immediately."]', 'sunny_side_up_egg.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('5a7ce1f4-f945-4e13-b4a8-ea4e158db34f', 'omelet-5a7ce1f4-f945-4e13-b4a8-ea4e158db34f', 'Omelet', '/omelet.png', '["2 eggs", "Salt and pepper to taste", "Butter or oil", "Cheese (optional)", "Vegetables (optional)"]', '["In a bowl, whisk the eggs with salt and pepper.", "Heat butter or oil in a skillet over medium heat.", "Pour the egg mixture into the skillet and cook until the edges start to set.", "Add cheese and vegetables if desired.", "Fold the omelet in half and cook for another minute until fully set.", "Slide onto a plate and serve hot."]', 'omelet.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('5a7ce1f4-f945-4e13-b4a8-ea4e158db34f', 'scrambled-5a7ce1f4-f945-4e13-b4a8-ea4e158db34f', 'Scrambled Eggs', '/scrumbeled.png', '["2 eggs", "Salt and pepper to taste", "Butter or oil", "Milk or cream (optional)"]', '["In a bowl, whisk the eggs with salt, pepper, and a splash of milk or cream if desired.", "Heat butter or oil in a skillet over medium heat.", "Pour the egg mixture into the skillet.", "Gently stir the eggs with a spatula, pushing them from the edges to the center as they cook.", "Continue cooking until the eggs are softly set and slightly runny in places.", "Remove from heat and serve immediately."]', 'scrambled_eggs.html', 1);

-- Recipes for User 7129bf5e-28c8-471d-ba51-004b34977954
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('7129bf5e-28c8-471d-ba51-004b34977954', 'boiled-7129bf5e-28c8-471d-ba51-004b34977954', 'Boiled Egg', '/boiled.png', '["1 egg", "Water", "Salt (optional)"]', '["Place the egg in a saucepan and cover it with cold water.", "Bring the water to a boil over medium-high heat.", "Once boiling, reduce the heat to low and let it simmer for 9-12 minutes, depending on your desired level of doneness.", "Remove the egg from the hot water and place it in a bowl of ice water to cool for a few minutes.", "Peel the egg and enjoy!"]', 'boiling_egg.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('7129bf5e-28c8-471d-ba51-004b34977954', 'sunny-side-7129bf5e-28c8-471d-ba51-004b34977954', 'Sunny Side Up Egg', '/sunnysideup.png', '["1 egg", "Butter", "Salt and pepper to taste"]', '["Heat a non-stick skillet over medium heat and add butter.", "Crack the egg into the skillet and cook until the whites are set but the yolk remains runny.", "Season with salt and pepper.", "Slide onto a plate and serve immediately."]', 'sunny_side_up_egg.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('7129bf5e-28c8-471d-ba51-004b34977954', 'omelet-7129bf5e-28c8-471d-ba51-004b34977954', 'Omelet', '/omelet.png', '["2 eggs", "Salt and pepper to taste", "Butter or oil", "Cheese (optional)", "Vegetables (optional)"]', '["In a bowl, whisk the eggs with salt and pepper.", "Heat butter or oil in a skillet over medium heat.", "Pour the egg mixture into the skillet and cook until the edges start to set.", "Add cheese and vegetables if desired.", "Fold the omelet in half and cook for another minute until fully set.", "Slide onto a plate and serve hot."]', 'omelet.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('7129bf5e-28c8-471d-ba51-004b34977954', 'scrambled-7129bf5e-28c8-471d-ba51-004b34977954', 'Scrambled Eggs', '/scrumbeled.png', '["2 eggs", "Salt and pepper to taste", "Butter or oil", "Milk or cream (optional)"]', '["In a bowl, whisk the eggs with salt, pepper, and a splash of milk or cream if desired.", "Heat butter or oil in a skillet over medium heat.", "Pour the egg mixture into the skillet.", "Gently stir the eggs with a spatula, pushing them from the edges to the center as they cook.", "Continue cooking until the eggs are softly set and slightly runny in places.", "Remove from heat and serve immediately."]', 'scrambled_eggs.html', 1);

-- Recipes for User 82707fb8-f6eb-421f-ae8d-52b18a9ae7c5
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('82707fb8-f6eb-421f-ae8d-52b18a9ae7c5', 'boiled-82707fb8-f6eb-421f-ae8d-52b18a9ae7c5', 'Boiled Egg', '/boiled.png', '["1 egg", "Water", "Salt (optional)"]', '["Place the egg in a saucepan and cover it with cold water.", "Bring the water to a boil over medium-high heat.", "Once boiling, reduce the heat to low and let it simmer for 9-12 minutes, depending on your desired level of doneness.", "Remove the egg from the hot water and place it in a bowl of ice water to cool for a few minutes.", "Peel the egg and enjoy!"]', 'boiling_egg.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('82707fb8-f6eb-421f-ae8d-52b18a9ae7c5', 'sunny-side-82707fb8-f6eb-421f-ae8d-52b18a9ae7c5', 'Sunny Side Up Egg', '/sunnysideup.png', '["1 egg", "Butter", "Salt and pepper to taste"]', '["Heat a non-stick skillet over medium heat and add butter.", "Crack the egg into the skillet and cook until the whites are set but the yolk remains runny.", "Season with salt and pepper.", "Slide onto a plate and serve immediately."]', 'sunny_side_up_egg.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('82707fb8-f6eb-421f-ae8d-52b18a9ae7c5', 'omelet-82707fb8-f6eb-421f-ae8d-52b18a9ae7c5', 'Omelet', '/omelet.png', '["2 eggs", "Salt and pepper to taste", "Butter or oil", "Cheese (optional)", "Vegetables (optional)"]', '["In a bowl, whisk the eggs with salt and pepper.", "Heat butter or oil in a skillet over medium heat.", "Pour the egg mixture into the skillet and cook until the edges start to set.", "Add cheese and vegetables if desired.", "Fold the omelet in half and cook for another minute until fully set.", "Slide onto a plate and serve hot."]', 'omelet.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('82707fb8-f6eb-421f-ae8d-52b18a9ae7c5', 'scrambled-82707fb8-f6eb-421f-ae8d-52b18a9ae7c5', 'Scrambled Eggs', '/scrumbeled.png', '["2 eggs", "Salt and pepper to taste", "Butter or oil", "Milk or cream (optional)"]', '["In a bowl, whisk the eggs with salt, pepper, and a splash of milk or cream if desired.", "Heat butter or oil in a skillet over medium heat.", "Pour the egg mixture into the skillet.", "Gently stir the eggs with a spatula, pushing them from the edges to the center as they cook.", "Continue cooking until the eggs are softly set and slightly runny in places.", "Remove from heat and serve immediately."]', 'scrambled_eggs.html', 1);

-- Recipes for User b0ada832-f96c-47e7-842f-29200a8585a9
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('b0ada832-f96c-47e7-842f-29200a8585a9', 'boiled-b0ada832-f96c-47e7-842f-29200a8585a9', 'Boiled Egg', '/boiled.png', '["1 egg", "Water", "Salt (optional)"]', '["Place the egg in a saucepan and cover it with cold water.", "Bring the water to a boil over medium-high heat.", "Once boiling, reduce the heat to low and let it simmer for 9-12 minutes, depending on your desired level of doneness.", "Remove the egg from the hot water and place it in a bowl of ice water to cool for a few minutes.", "Peel the egg and enjoy!"]', 'boiling_egg.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('b0ada832-f96c-47e7-842f-29200a8585a9', 'sunny-side-b0ada832-f96c-47e7-842f-29200a8585a9', 'Sunny Side Up Egg', '/sunnysideup.png', '["1 egg", "Butter", "Salt and pepper to taste"]', '["Heat a non-stick skillet over medium heat and add butter.", "Crack the egg into the skillet and cook until the whites are set but the yolk remains runny.", "Season with salt and pepper.", "Slide onto a plate and serve immediately."]', 'sunny_side_up_egg.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('b0ada832-f96c-47e7-842f-29200a8585a9', 'omelet-b0ada832-f96c-47e7-842f-29200a8585a9', 'Omelet', '/omelet.png', '["2 eggs", "Salt and pepper to taste", "Butter or oil", "Cheese (optional)", "Vegetables (optional)"]', '["In a bowl, whisk the eggs with salt and pepper.", "Heat butter or oil in a skillet over medium heat.", "Pour the egg mixture into the skillet and cook until the edges start to set.", "Add cheese and vegetables if desired.", "Fold the omelet in half and cook for another minute until fully set.", "Slide onto a plate and serve hot."]', 'omelet.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('b0ada832-f96c-47e7-842f-29200a8585a9', 'scrambled-b0ada832-f96c-47e7-842f-29200a8585a9', 'Scrambled Eggs', '/scrumbeled.png', '["2 eggs", "Salt and pepper to taste", "Butter or oil", "Milk or cream (optional)"]', '["In a bowl, whisk the eggs with salt, pepper, and a splash of milk or cream if desired.", "Heat butter or oil in a skillet over medium heat.", "Pour the egg mixture into the skillet.", "Gently stir the eggs with a spatula, pushing them from the edges to the center as they cook.", "Continue cooking until the eggs are softly set and slightly runny in places.", "Remove from heat and serve immediately."]', 'scrambled_eggs.html', 1);

-- Recipes for User c76eae29-11ce-45ab-9bbf-7435374e60d1
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('c76eae29-11ce-45ab-9bbf-7435374e60d1', 'boiled-c76eae29-11ce-45ab-9bbf-7435374e60d1', 'Boiled Egg', '/boiled.png', '["1 egg", "Water", "Salt (optional)"]', '["Place the egg in a saucepan and cover it with cold water.", "Bring the water to a boil over medium-high heat.", "Once boiling, reduce the heat to low and let it simmer for 9-12 minutes, depending on your desired level of doneness.", "Remove the egg from the hot water and place it in a bowl of ice water to cool for a few minutes.", "Peel the egg and enjoy!"]', 'boiling_egg.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('c76eae29-11ce-45ab-9bbf-7435374e60d1', 'sunny-side-c76eae29-11ce-45ab-9bbf-7435374e60d1', 'Sunny Side Up Egg', '/sunnysideup.png', '["1 egg", "Butter", "Salt and pepper to taste"]', '["Heat a non-stick skillet over medium heat and add butter.", "Crack the egg into the skillet and cook until the whites are set but the yolk remains runny.", "Season with salt and pepper.", "Slide onto a plate and serve immediately."]', 'sunny_side_up_egg.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('c76eae29-11ce-45ab-9bbf-7435374e60d1', 'omelet-c76eae29-11ce-45ab-9bbf-7435374e60d1', 'Omelet', '/omelet.png', '["2 eggs", "Salt and pepper to taste", "Butter or oil", "Cheese (optional)", "Vegetables (optional)"]', '["In a bowl, whisk the eggs with salt and pepper.", "Heat butter or oil in a skillet over medium heat.", "Pour the egg mixture into the skillet and cook until the edges start to set.", "Add cheese and vegetables if desired.", "Fold the omelet in half and cook for another minute until fully set.", "Slide onto a plate and serve hot."]', 'omelet.html', 1);
INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) VALUES ('c76eae29-11ce-45ab-9bbf-7435374e60d1', 'scrambled-c76eae29-11ce-45ab-9bbf-7435374e60d1', 'Scrambled Eggs', '/scrumbeled.png', '["2 eggs", "Salt and pepper to taste", "Butter or oil", "Milk or cream (optional)"]', '["In a bowl, whisk the eggs with salt, pepper, and a splash of milk or cream if desired.", "Heat butter or oil in a skillet over medium heat.", "Pour the egg mixture into the skillet.", "Gently stir the eggs with a spatula, pushing them from the edges to the center as they cook.", "Continue cooking until the eggs are softly set and slightly runny in places.", "Remove from heat and serve immediately."]', 'scrambled_eggs.html', 1);


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
