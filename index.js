const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
// http caching middleware
const apicache = require('apicache');
const cache = apicache.middleware;
require('dotenv').config();

console.log(__dirname);
const { login, logout } = require( __dirname + "/controls/authController");
const recipeController = require(__dirname +"/controls/recipeController");
const statsController = require(__dirname + "/controls/statsController");
const userModel = require("./models/userModel"); // needed to lookup user by cookie
const app = express();
// Only cache for anonymous users (no auth cookie)
const cacheAnonymousOnly = cache('5 minutes', (req, res) => {
  return res.statusCode === 200 && !req.signedCookies.userId;
});

// ---------- middleware ----------
app.use(express.static(path.join(__dirname, "public"), {
  maxAge: '1d', // Cache for 1 day
  etag: true
}));

app.use('/uploads', express.static(path.join(__dirname, "public/uploads"), {
  maxAge: '7d',
  immutable: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Needed for API JSON requests
app.use(cookieParser(process.env.SESSION_SECRET));

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
app.set("views", path.join(__dirname, "views"));

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
  res.set('Cache-Control', 'private, no-cache');
  if (!res.locals.user) {
    return res.redirect("/");
  }
  const recipes = await recipeController.getAllRecipes(res.locals.user.id);
  res.render("menu", { message: req.query.msg, recipes });
});

app.get("/recipe/:id", recipeController.showRecipe);


// Stats & Leaderboard
app.post("/api/stats", statsController.recordStat);
app.get("/leaderboard", cache('10 seconds'), statsController.showLeaderboard);
app.get("/api/leaderboard", cache('10 seconds'), statsController.getLeaderboardJson);

// Add Recipe
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/uploads'));
  },
  filename: function (req, file, cb) {
    // Basic sanitization
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'));
  }
});
const upload = multer({ storage: storage });

// Ensure uploads dir exists (optional check, but good practice)
const fs = require('fs');
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.get("/add-recipe", recipeController.showAddRecipeForm);
app.post("/add-recipe", upload.single('uploadImage'), recipeController.addRecipe);

app.get("/recipe/:id/edit", recipeController.showEditRecipeForm);
app.post("/recipe/:id/edit", upload.single('uploadImage'), recipeController.updateRecipe);
app.post("/recipe/:id/delete", recipeController.deleteRecipe);

app.get("/user-recipy", recipeController.showUserRecipes);

// ---------- server ----------
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});