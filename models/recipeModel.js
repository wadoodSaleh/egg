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

module.exports = {
  getRecipeBySlug,
  getAllRecipes
};
