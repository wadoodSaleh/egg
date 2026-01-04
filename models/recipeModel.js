const db = require("./db");

async function getRecipeBySlug(slug, userId) {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM recipes WHERE slug = ? AND user_id = ?', 
      [slug, userId]
    );
    return rows[0]; 
  } catch (err) {
    console.error("Error in getRecipeBySlug:", err);
    return null;
  }
}

async function getAllRecipes(userId) {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM recipes WHERE user_id = ?', 
      [userId]
    );
    return rows;
  } catch (err) {
    console.error("Error in getAllRecipes:", err);
    return [];
  }
}

async function createRecipe(data) {
  try {
    const query = `
      INSERT INTO recipes 
      (user_id, slug, name, image_path, ingredients, instructions, animation, losing_minute, is_shared)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      data.userId,
      data.slug,
      data.name,
      data.imagePath,
      JSON.stringify(data.ingredients),
      JSON.stringify(data.instructions),
      data.animation,
      data.losingMinute,
      data.isShared
    ]);
    return result.insertId;
  } catch (err) {
    console.error("Error in createRecipe:", err);
    throw err;
  }
}

module.exports = {
  getRecipeBySlug,
  getAllRecipes,
  createRecipe
};
