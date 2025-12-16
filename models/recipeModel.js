const fs = require("fs");
const path = require("path");

const recipesPath = path.join(__dirname, "../data/recipes.json");

function getRecipeById(id) {
  const data = fs.readFileSync(recipesPath, "utf-8");
  const recipes = JSON.parse(data);

  return recipes.find(recipe => recipe.id === id);
}

module.exports = {
  getRecipeById
};
