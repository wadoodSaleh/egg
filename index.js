const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
console.log(__dirname);
const { login, logout } = require( __dirname + "/controls/authController");
const recipeController = require(__dirname +"/controls/recipeController");
const userModel = require("./models/userModel"); // needed to lookup user by cookie
const app = express();

// ---------- middleware ----------
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser("super_secret_egg_timer_key"));

// Make 'user' available to all views if cookie is present
app.use((req, res, next) => {
  const userId = req.signedCookies.userId;
  if (userId) {
    const user = userModel.findById(userId);
    res.locals.user = user;
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

app.get("/menu", (req, res) => {
  res.render("menu", { message: req.query.msg });
});

app.get("/recipe/:id", recipeController.showRecipe);
// ---------- server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});