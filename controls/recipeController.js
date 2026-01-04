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

function showAddRecipeForm(req, res) {
  if (!res.locals.user) {
    return res.redirect("/");
  }
  res.render("add-recipe");
}

async function addRecipe(req, res) {
  const user = res.locals.user;
  if (!user) {
    return res.status(401).send("Unauthorized");
  }

  const { name, ingredients, instructions, losing_minute, imageSource, defaultImage, animation, is_shared } = req.body;
  
  // Handle image path
  let imagePath = defaultImage;
  if (imageSource === 'upload' && req.file) {
    imagePath = '/uploads/' + req.file.filename;
  }

  // Generate slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + user.id;

  // Parse textareas to arrays
  const ingredientsArray = ingredients.split('\r\n').filter(line => line.trim() !== '');
  const instructionsArray = instructions.split('\r\n').filter(line => line.trim() !== '');

  const recipeData = {
    userId: user.id,
    slug: slug,
    name: name,
    imagePath: imagePath,
    ingredients: ingredientsArray,
    instructions: instructionsArray,
    animation: animation,
    losingMinute: parseInt(losing_minute) || 1,
    isShared: is_shared === 'true' ? 1 : 0
  };

  try {
    await recipeModel.createRecipe(recipeData);
    res.redirect('/menu?msg=' + encodeURIComponent('Recipe created successfully!'));
  } catch (err) {
    console.error("Error adding recipe:", err);
    res.render("add-recipe", { error: "Failed to create recipe." });
  }
}

module.exports = {
  showRecipe,
  getAllRecipes,
  showAddRecipeForm,
  addRecipe
};
