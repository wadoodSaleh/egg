const recipeModel = require("../models/recipeModel");

function showRecipe(req, res) {
  const recipeId = req.params.id;

  const recipe = recipeModel.getRecipeById(recipeId);

  if (!recipe) {
    return res.send("Recipe not found");
  }

  res.render("recipe", { recipe });
}

module.exports = {
  showRecipe
};
