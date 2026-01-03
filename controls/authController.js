const path = require("path");
const userModel = require("../models/userModel");

async function login(req, res) {
  const { email, password, username } = req.body;

  console.log("[authController] login attempt:", { email, username });

  try {
    const result = await userModel.loginOrRegister(email, password, username);
    console.log("[authController] result:", result && result.status);

    if (result.status === "wrong_password") {
      console.log("[authController] wrong password for", email);
      return res.render("home", { message: "Wrong password" });
    }

    // Helper to set cookie
    const setCookie = (user) => {
      res.cookie("userId", user.id, {
        signed: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      });
    };

    if (result.status === "login_success") {
      const msg = `Welcome back, ${result.user.username}!`;
      console.log("[authController] login success, redirecting to /menu");
      setCookie(result.user);
      return res.redirect(`/menu?msg=${encodeURIComponent(msg)}`);
    }

    if (result.status === "user_created") {
      const msg = `Account created! Welcome, ${result.user.username}!`;
      console.log("[authController] user created, redirecting to /menu");
      setCookie(result.user);
      return res.redirect(`/menu?msg=${encodeURIComponent(msg)}`);
    }

    return res.render("home", { message: "An error occurred" });
  } catch (err) {
    console.error("[authController] error:", err);
    return res.render("home", { message: "Server error during login" });
  }
}

function logout(req, res) {
  res.clearCookie("userId");
  res.redirect("/");
}

module.exports = { login, logout };