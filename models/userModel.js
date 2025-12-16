const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const usersFilePath = path.join(__dirname, "../data/users.json");

// ---------- helpers ----------
function readUsers() {
  const data = fs.readFileSync(usersFilePath, "utf-8");
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

function getNextId(users) {
  if (users.length === 0) return 1;
  return users[users.length - 1].id + 1;
}

// ---------- main logic ----------
function loginOrRegister(email, password, username = null) {
  const users = readUsers();

  const existingUser = users.find(u => u.email === email);

  // USER EXISTS
  if (existingUser) {
    const passwordMatch = bcrypt.compareSync(password, existingUser.password);

    if (!passwordMatch) {
      return { status: "wrong_password" };
    }

    return {
      status: "login_success",
      user: existingUser
    };
  }

  // NEW USER → REGISTER
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: getNextId(users),
    username: username || email.split("@")[0],
    email,
    password: hashedPassword
  };

  users.push(newUser);
  writeUsers(users);

  return {
    status: "user_created",
    user: newUser
  };
}

module.exports = {
  loginOrRegister
};
