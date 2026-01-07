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

const methodOverride = require('method-override');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(methodOverride('_method')); // Support PUT/DELETE via ?_method=

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
  if (res.locals.user) {
    return res.redirect("/dashboard");
  }
  res.render("home");
});

app.post("/login", login);
app.get("/logout", logout);

// Dashboard (formerly /menu)
app.get("/dashboard", async (req, res) => {
  res.set('Cache-Control', 'private, no-cache');
  if (!res.locals.user) {
    return res.redirect("/");
  }
  const recipes = await recipeController.getAllRecipes(res.locals.user.id);
  res.render("menu", { message: req.query.msg, recipes });
});

// redirect old /menu to /dashboard for backward compatibility (optional, but good)
app.get("/menu", (req, res) => res.redirect("/dashboard"));


// Stats & Leaderboard
app.post("/api/stats", statsController.recordStat);
app.get("/leaderboard", cache('10 seconds'), statsController.showLeaderboard);
app.get("/api/leaderboard", cache('10 seconds'), statsController.getLeaderboardJson);

// Helper for uploads (keep existing)
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'));
  }
});
const upload = multer({ storage: storage });

const fs = require('fs');
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// RESTful Recipe Routes
// GET  /recipes        -> Check shared recipes? No, current design separates user recipes vs shared.
// GET  /recipes/custom -> Maybe? Let's stick to existing logic mapping.

// 1. List Shared Recipes
app.get("/recipes/shared", recipeController.showUserRecipes);

// 2. New Recipe Form
app.get("/recipes/new", recipeController.showAddRecipeForm);

// 3. Create Recipe
app.post("/recipes", upload.single('uploadImage'), recipeController.addRecipe);

// 4. Show Single Recipe
app.get("/recipes/:id", recipeController.showRecipe);

// 5. Edit Recipe Form
app.get("/recipes/:id/edit", recipeController.showEditRecipeForm);

// 6. Update Recipe
app.put("/recipes/:id", upload.single('uploadImage'), recipeController.updateRecipe);

// 7. Delete Recipe
app.delete("/recipes/:id", recipeController.deleteRecipe);

// Legacy Redirects (to prevent breaking if user hits back button or old link)
app.get("/add-recipe", (req, res) => res.redirect("/recipes/new"));
app.get("/recipe/:id", (req, res) => res.redirect(`/recipes/${req.params.id}`));
app.get("/user-recipy", (req, res) => res.redirect("/recipes/shared"));

// ---------- server ----------
// 404 Handler (Last Route)
app.use((req, res, next) => {
  res.status(404).render('errors/404');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('errors/500');
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});