const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
require('dotenv').config();

console.log(__dirname);
const { login, logout } = require( __dirname + "/controls/authController");
const recipeController = require(__dirname +"/controls/recipeController");
const statsController = require(__dirname + "/controls/statsController");
const userModel = require("./models/userModel"); // needed to lookup user by cookie
const app = express();

// ---------- middleware ----------
app.use(express.static(path.join(__dirname, "public")));
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
// ---------- server ----------
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});