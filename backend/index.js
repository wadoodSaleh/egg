const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");

require('dotenv').config({ path: path.join(__dirname, '../.env') });
const methodOverride = require('method-override');

console.log(__dirname);
const { login, logout } = require( "./controls/authController");
const recipeController = require("./controls/recipeController");
const statsController = require("./controls/statsController");
const userModel = require("./models/userModel"); // needed to lookup user by cookie
const app = express();

// ---------- middleware ----------
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Needed for API JSON requests
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(methodOverride('_method'));

// Make 'user' available to all views if cookie is present
app.use(async (req, res, next) => {
  const userId = req.signedCookies.userId;
  if (userId) {
    try {
      const user = await userModel.findById(userId);
      res.locals.user = user;
    } catch (err) {
      console.error("Error fetching user in middleware:", err);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});

// ---------- view engine ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));

// ---------- routes ----------
app.get("/", (req, res) => {
  // If already logged in, redirect to menu
  if (res.locals.user) {
    return res.redirect("/menu");
  }
  res.render("home");
});

app.post("/login", login);
app.get("/logout", logout);

app.get("/menu", async (req, res) => {
  if (!res.locals.user) {
    return res.redirect("/");
  }
  const recipes = await recipeController.getAllRecipes(res.locals.user.id);
  res.render("menu", { message: req.query.msg, recipes });
});

app.get("/recipe/:id", recipeController.showRecipe);


// Stats & Leaderboard
app.post("/api/stats", statsController.recordStat);
app.get("/leaderboard", statsController.showLeaderboard);

// Add Recipe
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../frontend/public/uploads'));
  },
  filename: function (req, file, cb) {
    // Basic sanitization
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'));
  }
});
const upload = multer({ storage: storage });

// Ensure uploads dir exists (optional check, but good practice)
const fs = require('fs');
const uploadDir = path.join(__dirname, '../frontend/public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.get("/add-recipe", recipeController.showAddRecipeForm);
app.post("/add-recipe", upload.single('uploadImage'), recipeController.addRecipe);

app.get("/recipe/:id/edit", recipeController.showEditRecipeForm);
app.put("/recipe/:id", upload.single('uploadImage'), recipeController.updateRecipe);
app.delete("/recipe/:id", recipeController.deleteRecipe);

app.get("/user-recipy", recipeController.showUserRecipes);

// ---------- server ----------
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});