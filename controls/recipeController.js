const recipeModel = require("../models/recipeModel");

async function showRecipe(req, res) {
  const recipeSlug = req.params.id; // It's actually a slug now in the URL
  const user = res.locals.user;

  if (!user) {
    return res.redirect("/"); // Enforce login
  }

  // Get recipe strictly by slug first
  const recipe = await recipeModel.getRecipeBySlug(recipeSlug);

  if (!recipe) {
    return res.status(404).send("Recipe not found");
  }

  // Check access: Must be owner OR recipe must be shared
  const isOwner = recipe.user_id === user.id;
  if (!isOwner && !recipe.is_shared) {
    return res.status(403).send("You do not have permission to view this recipe.");
  }

  res.render("recipe", { recipe, isOwner });
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

  const { name, ingredients, instructions, winning_minute, losing_minute, imageSource, defaultImage, animation, is_shared } = req.body;
  
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
    winningMinute: parseFloat(winning_minute) || 0.5,
    losingMinute: parseInt(losing_minute) || 1,
    isShared: is_shared === 'true' ? 1 : 0
  };

  try {
    await recipeModel.createRecipe(recipeData);
    res.redirect('/menu?msg=' + encodeURIComponent('Recipe created successfully!'));
  } catch (err) {
    // Check for duplicate entry error (MySQL error code 1062)
    // We check code, message, and toString() to be safe
    if (
      err.code === 'ER_DUP_ENTRY' || 
      (err.message && err.message.includes('Duplicate entry')) ||
      err.toString().includes('Duplicate entry')
    ) {
       // Log a clean message instead of a stack trace
       // console.log("Duplicate recipe creation attempt blocked.");
       return res.render("add-recipe", { error: "A recipe with this name already exists! Please choose a different name." });
    }

    // Only log unexpected errors
    console.error("Error adding recipe:", err);
    res.render("add-recipe", { error: "Failed to create recipe. Please try again." });
  }
}

async function showEditRecipeForm(req, res) {
  const user = res.locals.user;
  if (!user) {
    return res.redirect("/");
  }

  const recipeSlug = req.params.id;
  const recipe = await recipeModel.getRecipeBySlug(recipeSlug);

  if (!recipe) {
    return res.status(404).send("Recipe not found");
  }

  if (recipe.user_id !== user.id) {
    return res.status(403).send("You cannot edit this recipe.");
  }

  res.render("add-recipe", { recipe, isEdit: true });
}

async function updateRecipe(req, res) {
  const user = res.locals.user;
  if (!user) {
    return res.status(401).send("Unauthorized");
  }

  const recipeSlug = req.params.id;
  const oldRecipe = await recipeModel.getRecipeBySlug(recipeSlug);

  if (!oldRecipe || oldRecipe.user_id !== user.id) {
    return res.status(403).send("Unauthorized");
  }

  const { name, ingredients, instructions, winning_minute, losing_minute, imageSource, defaultImage, animation, is_shared } = req.body;
  
  // Handle image path
  let imagePath = oldRecipe.image_path;
  if (imageSource === 'upload' && req.file) {
    imagePath = '/uploads/' + req.file.filename;
  } else if (imageSource === 'default') {
     imagePath = defaultImage;
  }

  // Generate slug (keep old slug if name hasn't changed to avoid URL breaking, or update it?)
  // For simplicity and better URLs, let's update it if name changes, but append user ID to keep unique
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + user.id;

  const ingredientsArray = ingredients.split('\r\n').filter(line => line.trim() !== '');
  const instructionsArray = instructions.split('\r\n').filter(line => line.trim() !== '');

  const recipeData = {
    slug: slug,
    name: name,
    imagePath: imagePath,
    ingredients: ingredientsArray,
    instructions: instructionsArray,
    animation: animation,
    winningMinute: parseFloat(winning_minute) || 0.5,
    losingMinute: parseInt(losing_minute) || 1,
    isShared: is_shared === 'true' ? 1 : 0
  };

  try {
    await recipeModel.updateRecipe(oldRecipe.id, recipeData);
    res.redirect('/recipe/' + slug);
  } catch (err) {
     if (
      err.code === 'ER_DUP_ENTRY' || 
      (err.message && err.message.includes('Duplicate entry')) ||
      err.toString().includes('Duplicate entry')
    ) {
       return res.render("add-recipe", { recipe: { ...recipeData, id: oldRecipe.id }, isEdit: true, error: "A recipe with this name already exists! Please choose a different name." });
    }
    console.error("Error updating recipe:", err);
    res.render("add-recipe", { recipe: oldRecipe, isEdit: true, error: "Failed to update recipe." });
  }
}

async function deleteRecipe(req, res) {
  const user = res.locals.user;
  if (!user) {
    return res.status(401).send("Unauthorized");
  }

  const recipeSlug = req.params.id;
  const recipe = await recipeModel.getRecipeBySlug(recipeSlug);

  if (!recipe || recipe.user_id !== user.id) {
    return res.status(403).send("Unauthorized");
  }

  await recipeModel.deleteRecipe(recipe.id);
  res.redirect("/menu?msg=" + encodeURIComponent("Recipe deleted successfully."));
}

async function showUserRecipes(req, res) {
  const recipes = await recipeModel.getSharedRecipes();
  res.render("user-recipes", { recipes });

}

module.exports = {
  showRecipe,
  getAllRecipes,
  showAddRecipeForm,
  addRecipe,
  addRecipe,
  showEditRecipeForm,
  updateRecipe,
  deleteRecipe,
  showUserRecipes
};
