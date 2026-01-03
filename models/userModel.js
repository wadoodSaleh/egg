const db = require("./db");
const bcrypt = require("bcrypt");

// Defaults array for easier code insertion (could also read from JSON, but clean code is better)
const defaultRecipes = [
  {
    slug: 'boiled', name: 'Boiled Egg', image_path: '/boiled.png',
    ingredients: JSON.stringify(["1 egg", "Water", "Salt (optional)"]),
    instructions: JSON.stringify(["Place the egg in a saucepan and cover it with cold water.", "Bring the water to a boil over medium-high heat.", "Once boiling, reduce the heat to low and let it simmer for 9-12 minutes.", "Remove the egg from the hot water and place it in a bowl of ice water to cool.", "Peel the egg and enjoy!"]),
    animation: 'boiling_egg.html', losing_minute: 1
  },
  {
    slug: 'sunny-side', name: 'Sunny Side Up Egg', image_path: '/sunnysideup.jpg',
    ingredients: JSON.stringify(["1 egg", "Butter", "Salt and pepper to taste"]),
    instructions: JSON.stringify(["Heat a non-stick skillet over medium heat and add butter.", "Crack the egg into the skillet and cook until the whites are set.", "Season with salt and pepper.", "Slide onto a plate and serve immediately."]),
    animation: 'sunny_side_up_egg.html', losing_minute: 1
  },
  {
    slug: 'omelet', name: 'Omelet', image_path: '/omelete.jpg',
    ingredients: JSON.stringify(["2 eggs", "Salt and pepper to taste", "Butter or oil", "Cheese (optional)", "Vegetables (optional)"]),
    instructions: JSON.stringify(["In a bowl, whisk the eggs with salt and pepper.", "Heat butter or oil in a skillet over medium heat.", "Pour the egg mixture into the skillet.", "Add cheese and vegetables if desired.", "Fold the omelet in half and cook.", "Slide onto a plate and serve hot."]),
    animation: 'omelet.html', losing_minute: 1
  },
  {
    slug: 'scrambled', name: 'Scrambled Eggs', image_path: '/scrambled.jpg',
    ingredients: JSON.stringify(["2 eggs", "Salt and pepper to taste", "Butter or oil", "Milk or cream (optional)"]),
    instructions: JSON.stringify(["Whisk eggs with salt, pepper, and milk.", "Heat butter in skillet.", "Pour egg mixture.", "Gently stir eggs.", "Cook until set.", "Remove from heat."]),
    animation: 'scrambled_eggs.html', losing_minute: 1
  }
];

async function loginOrRegister(email, password, username = null) {
  try {
    // Check if user exists
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const existingUser = rows[0];

    // USER EXISTS
    if (existingUser) {
      const passwordMatch = bcrypt.compareSync(password, existingUser.password);
      if (!passwordMatch) {
        return { status: "wrong_password" };
      }
      return { status: "login_success", user: existingUser };
    }

    // NEW USER → REGISTER
    const hashedPassword = bcrypt.hashSync(password, 10);
    const uname = username || email.split("@")[0];

    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [uname, email, hashedPassword]
    );

    // Get the new user's ID
    const [newUserRows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const newUser = newUserRows[0];
    const userId = newUser.id;

    // Insert Default Recipes with UNIQUE slugs (appending userId)
    for (const r of defaultRecipes) {
      const uniqueSlug = `${r.slug}-${userId}`;
      await db.execute(
        `INSERT INTO recipes (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, uniqueSlug, r.name, r.image_path, r.ingredients, r.instructions, r.animation, r.losing_minute]
      );
    }

    return { status: "user_created", user: newUser };

  } catch (err) {
    console.error("Error in loginOrRegister:", err);
    throw err;
  }
}

async function findById(id) {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  } catch (err) {
    console.error("Error in findById:", err);
    return null;
  }
}

module.exports = {
  loginOrRegister,
  findById
};
