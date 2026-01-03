const recipeModel = require("../models/recipeModel");

async function showRecipe(req, res) {
  const recipeSlug = req.params.id; // It's actually a slug now in the URL
  const user = res.locals.user;

  if (!user) {
    return res.redirect("/"); // Enforce login
  }

  const recipe = await recipeModel.getRecipeBySlug(recipeSlug, user.id);

  if (!recipe) {
    return res.status(404).send("Recipe not found");
  }

  res.render("recipe", { recipe });
}

async function getAllRecipes(userId) {
  return await recipeModel.getAllRecipes(userId);
}

module.exports = {
  showRecipe,
  getAllRecipes
};
