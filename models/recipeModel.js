const db = require("./db");

async function getRecipeBySlug(slug) {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM recipes WHERE slug = ?', 
      [slug]
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
      (user_id, slug, name, image_path, ingredients, instructions, animation, winning_minute, losing_minute, is_shared)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      data.userId,
      data.slug,
      data.name,
      data.imagePath,
      JSON.stringify(data.ingredients),
      JSON.stringify(data.instructions),
      data.animation,
      data.winningMinute,
      data.losingMinute,
      data.isShared
    ]);
    return result.insertId;
  } catch (err) {
    // console.error("Error in createRecipe:", err);
    throw err;
  }
}

async function getSharedRecipes() {
  try {
    const query = `
      SELECT r.*, u.username 
      FROM recipes r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.is_shared = 1
      ORDER BY r.created_at DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  } catch (err) {
    console.error("Error in getSharedRecipes:", err);
    return [];
  }
}

async function updateRecipe(id, data) {
  try {
    const query = `
      UPDATE recipes 
      SET name = ?, image_path = ?, ingredients = ?, instructions = ?, animation = ?, winning_minute = ?, losing_minute = ?, is_shared = ?, slug = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [
      data.name,
      data.imagePath,
      JSON.stringify(data.ingredients),
      JSON.stringify(data.instructions),
      data.animation,
      data.winningMinute,
      data.losingMinute,
      data.isShared,
      data.slug,
      id
    ]);
    return result.affectedRows > 0;
  } catch (err) {
    // console.error("Error in updateRecipe:", err);
    throw err;
  }
}

async function deleteRecipe(id) {
  try {
    const [result] = await db.execute('DELETE FROM recipes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (err) {
    console.error("Error in deleteRecipe:", err);
    throw err;
  }
}

module.exports = {
  getRecipeBySlug,
  getAllRecipes,
  createRecipe,
  getSharedRecipes,
  updateRecipe,
  deleteRecipe
};
