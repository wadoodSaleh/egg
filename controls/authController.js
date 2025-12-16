const path = require("path");
const userModel = require("../models/userModel");

function login(req, res) {
  const { email, password, username } = req.body;

  console.log("[authController] login attempt:", { email, username });

  const result = userModel.loginOrRegister(email, password, username);
  console.log("[authController] result:", result && result.status);

  if (result.status === "wrong_password") {
    console.log("[authController] wrong password for", email);
    return res.render("home", { message: "Wrong password" });
  }

  if (result.status === "login_success") {
    const msg = `Welcome back, ${result.user.username}!`;
    console.log("[authController] login success, redirecting to /menu");
    return res.redirect(`/menu?msg=${encodeURIComponent(msg)}`);
  }

  if (result.status === "user_created") {
    const msg = `Account created! Welcome, ${result.user.username}!`;
    console.log("[authController] user created, redirecting to /menu");
    return res.redirect(`/menu?msg=${encodeURIComponent(msg)}`);
  }

  return res.render("home", { message: "An error occurred" });
}

module.exports = { login };