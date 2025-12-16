const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
console.log(__dirname);
const { login } = require( __dirname + "/controls/authController");
const recipeController = require(__dirname +"/controls/recipeController");
const app = express();

// ---------- middleware ----------
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// ---------- view engine ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ---------- routes ----------
app.get("/", (req, res) => {
  res.render("home");
});

app.post("/login", login);

app.get("/menu", (req, res) => {
  res.render("menu", { message: req.query.msg });
});

app.get("/recipe/:id", recipeController.showRecipe);
// ---------- server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});