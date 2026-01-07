# Codebase Explanation

This document provides a comprehensive overview of the **Egg Cooking Timer** application.

## 📂 Project Structure

The project follows a **Model-View-Controller (MVC)** architecture, separating concerns into distinct layers:

```
├── controls/       # Controllers: Handle logic and incoming requests
├── models/         # Models: Interact with the database (MySQL)
├── views/          # Views: Frontend templates (EJS)
├── public/         # Static Assets: CSS, JS, Images, Audio
├── docs/           # Documentation
├── index.js        # Entry Point: Server configuration and routes
└── .env            # Environment Variables (DB credentials, secrets)
```

---

## 🚀 Key Components

### 1. Entry Point (`index.js`)
This is the main file that starts the server. It:
*   Initializes **Express**.
*   Configures **Middleware** (BodyParser, CookieParser, MethodOverride).
*   Sets up the **View Engine** (EJS).
*   Defines **Routes** (RESTful paths like `/recipes`, `/dashboard`).
*   Connects routes to controllers.

### 2. Models (`models/`)
These files handle all database interactions using `mysql2`.
*   **`db.js`**: Creates a **connection pool** to the MySQL database. Using a pool allows multiple concurrent users.
*   **`userModel.js`**:
    *   `loginOrRegister`: Handles authentication. If a user doesn't exist, it creates one and hashes their password using `bcrypt`.
    *   `findById`: Retrieves user details for session management.
*   **`recipeModel.js`**: CRUD operations for recipes (Create, Read, Update, Delete). Handles the `winning_minute` and `losing_minute` logic.
*   **`statsModel.js`**: Tracks user performance (`cooked` vs `burned`) for the leaderboard.

### 3. Controllers (`controls/`)
These files contain the business logic.
*   **`authController.js`**: Manages Login/Logout. It sets a signed `userId` cookie to keep the user logged in.
*   **`recipeController.js`**: Handles recipe actions. It validates user ownership (you can only edit your own recipes) and manages image uploads.
*   **`statsController.js`**: Records game results and fetches leaderboard data.

### 4. Views (`views/`)
HTML templates rendered on the server.
*   **`timer.js` (Client-side)**: This is the heart of the interactive timer. It:
    *   Tracks time.
    *   Plays the **Alarm** when `winning_minute` is reached.
    *   Aligns iframe **animations** (`boiling_egg.html`, etc.) with the cooking progress.
    *   Sends results (`cooked` or `burned`) to the backend via AJAX.

---

## 🔄 Request Flows

### Authentication
1.  User submits Login form (`POST /login`).
2.  `authController` calls `userModel.loginOrRegister`.
3.  If successful, a signed cookie is set.
4.  User is redirected to `/dashboard`.

### RESTful Routing
We use standard HTTP methods for clarity:
*   **GET** `/recipes/new`: Show the "Add Recipe" form.
*   **POST** `/recipes`: Create the recipe in the DB.
*   **GET** `/recipes/:slug`: View a specific recipe.
*   **PUT** `/recipes/:slug`: Update a recipe (handled via `method-override`).
*   **DELETE** `/recipes/:slug`: Delete a recipe.

### The "Game" Logic
*   **Winning Minute**: The decimal cook time (e.g., 0.5 mins for 30s).
*   **Losing Minute**: When the egg burns.
*   **Logic**: If you stop the timer *after* the winning minute but *before* the losing minute, it counts as a **Win (Cooked)**. Otherwise, it's a **Loss**.

---

## 🛠 Database Schema
The database (MySQL) has three main tables:
1.  **`users`**: Stores credentials and ID.
2.  **`recipes`**: Stores recipe details, including `winning_minute` (FLOAT) and `losing_minute` (INT).
3.  **`stats`**: Records every attempt linked to a user and recipe for the leaderboard.
