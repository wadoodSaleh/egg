-- Insert statements for default recipes
-- Note: Replace @userId with the actual user ID variable when running

INSERT INTO recipes (user_id, slug, name, is_shared, image_path, ingredients, instructions, animation, losing_minute) VALUES
(@userId, 'boiled', 'Boiled Egg', FALSE, '/boiled.png', 
    '["1 egg", "Water", "Salt (optional)"]', 
    '["Place the egg in a saucepan and cover it with cold water.", "Bring the water to a boil over medium-high heat.", "Once boiling, reduce the heat to low and let it simmer for 9-12 minutes, depending on your desired level of doneness.", "Remove the egg from the hot water and place it in a bowl of ice water to cool for a few minutes.", "Peel the egg and enjoy!"]',
    'boiling_egg.html', 1),
(@userId, 'sunny-side', 'Sunny Side Up Egg', FALSE, '/sunnysideup.jpg',
    '["1 egg", "Butter", "Salt and pepper to taste"]',
    '["Heat a non-stick skillet over medium heat and add butter.", "Crack the egg into the skillet and cook until the whites are set but the yolk remains runny.", "Season with salt and pepper.", "Slide onto a plate and serve immediately."]',
    'sunny_side_up_egg.html', 1),
(@userId, 'omelet', 'Omelet', FALSE, '/omelete.jpg',
    '["2 eggs", "Salt and pepper to taste", "Butter or oil", "Cheese (optional)", "Vegetables (optional)"]',
    '["In a bowl, whisk the eggs with salt and pepper.", "Heat butter or oil in a skillet over medium heat.", "Pour the egg mixture into the skillet and cook until the edges start to set.", "Add cheese and vegetables if desired.", "Fold the omelet in half and cook for another minute until fully set.", "Slide onto a plate and serve hot."]',
    'omelet.html', 1),
(@userId, 'scrambled', 'Scrambled Eggs', FALSE, '/scrambled.jpg',
    '["2 eggs", "Salt and pepper to taste", "Butter or oil", "Milk or cream (optional)"]',
    '["In a bowl, whisk the eggs with salt, pepper, and a splash of milk or cream if desired.", "Heat butter or oil in a skillet over medium heat.", "Pour the egg mixture into the skillet.", "Gently stir the eggs with a spatula, pushing them from the edges to the center as they cook.", "Continue cooking until the eggs are softly set and slightly runny in places.", "Remove from heat and serve immediately."]',
    'scrambled_eggs.html', 1);
