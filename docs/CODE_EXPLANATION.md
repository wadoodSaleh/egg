# Codebase Explanation

This document provides a comprehensive technical overview of the **Egg Cooking Timer** application. The application is a full-stack web app that allows users to time their egg cooking, create custom recipes, and track their cooking statistics on a global leaderboard.

## 📂 Project Architecture

The project adheres to the **Model-View-Controller (MVC)** architectural pattern, ensuring separation of concerns and maintainability.

### Directory Structure
```
├── controls/       # Controllers: Business logic and request handling
├── models/         # Models: Data access layer (MySQL via db.js)
├── views/          # Views: Server-side templates (EJS)
├── public/         # Static Assets: Client-side JS, CSS, Images, Audio
├── data/           # Database setup scripts (schema.sql)
├── docs/           # Project documentation
├── index.js        # Entry Point: App configuration, middleware, and routes
└── .env            # Configuration: Secrets and database credentials
```

---

## � Authentication & Security

Authentication is stateful, relying on **signed cookies** to maintain user sessions.

*   **Logic**: `models/userModel.js` and `controls/authController.js`
*   **Method**: `loginOrRegister`
    1.  **Check User**: Queries the database for the provided email.
    2.  **Login**: If the user exists, compares the provided password with the stored hash using **bcrypt**.
    3.  **Register**: If the user does not exist, a new account is created. The password is hashed (salted) before storage. 
    4.  **Session**: On success, a `userId` cookie is set. This cookie is **signed** (using a secret key) to prevent tampering.
*   **Middleware**: A global middleware in `index.js` checks for the `userId` cookie on every request, fetches the user details, and attaches them to `res.locals.user` for use in views and controllers.

---

## 💾 Data Layer (Models & Database)

The application uses **MySQL** for persistence. The database schema (`data/schema.sql`) consists of three core tables:

### 1. Users Table (`users`)
*   **id**: UUID (Char 36) - acts as the primary key.
*   **username**, **email**, **password**: Standard credentials.

### 2. Recipes Table (`recipes`)
Stores both system default and user-created recipes.
*   **slug**: A unique URL-friendly identifier (e.g., `boiled-egg-user123`). It combines the recipe name and user ID to ensure uniqueness.
*   **winning_minute** (Float): The target cook time (e.g., `0.5` for 30 seconds).
*   **losing_minute** (Int): The time at which the egg is considered "burned".
*   **is_shared** (Boolean): Determines if the recipe appears in the public "Community Recipes" list.

### 3. Stats Table (`stats`)
Logs every cooking attempt.
*   **outcome**: ENUM('cooked', 'burned').
*   **Timestamps**: Automatically recorded.

### Leaderboard View
A SQL `VIEW` aggregates data from the `stats` table to calculate:
*   `total_cooked`: Number of successful attempts.
*   `total_burned`: Number of failed attempts.

---

## 🎮 Core Logic: The Cooking Timer

The interactive timer is the heart of the application, implemented on the client side in `public/timer.js`.

### Timer Mechanics
1.  **Initialization**: Reads `data-cook` (winning time) and `data-lose` (burn time) attributes from the DOM.
2.  **Loop**: A `setInterval` runs every second to increment the counter.
3.  **Winning Condition**:
    *   When the timer reaches the `winning_minute`, an **alarm sound** (`Alarm.mp3`) is triggered.
    *   The user must manually click **Stop**.
    *   If stopped *after* the winning time but *before* the losing time, it counts as a **Win (Cooked)**.
4.  **Losing Condition**:
    *   If the timer reaches the `losing_minute`, the egg is **Automaically Burned**.
    *   The timer stops, the "Lose" popup appears, and a 'burned' stat is recorded.
5.  **Animation Sync**:
    *   The timer communicates with the iframe animation (e.g., `boiled_egg.html`) to adjust the visual state (e.g., darkening the egg) based on the progress between winning and losing times.

### Stat Recording
The client sends an asynchronous `POST` request to `/api/stats` with the `recipeId` and `outcome`.

---

## 🛠 Controllers & Business Logic

### `controls/recipeController.js`
*   **CRUD Operations**: Manages creating, reading, updating, and deleting recipes.
*   **Authorization**: Ensures users can only edit/delete their own recipes.
*   **Image Handling**: Handles file uploads via `multer`. If no image is uploaded, a default is used.
*   **Validation**: Ensures `losing_minute` is always greater than `winning_minute`.

### `controls/statsController.js`
*   **Recording**: Receives stats from the frontend and saves them via `StatsModel`.
*   **Leaderboard**: Fetches aggregated data to render the leaderboard page.

---

## 🌐 API Routes

### Authentication
*   `POST /login`: Authenticates or registers a user.
*   `GET /logout`: Clears the session cookie.

### Recipes
*   `GET /dashboard`: Lists the current user's recipes.
*   `GET /recipes/shared`: Lists community recipes.
*   `GET /recipes/new`: Form to create a new recipe.
*   `POST /recipes`: Creates a new recipe.
*   `GET /recipes/:slug`: View a specific recipe.
*   `GET /recipes/:slug/edit`: Form to edit a recipe.
*   `PUT /recipes/:slug`: Updates a recipe.
*   `DELETE /recipes/:slug`: Deletes a recipe.

### Stats
*   `POST /api/stats`: Records a game outcome (Cooked/Burned).
*   `GET /leaderboard`: Renders the leaderboard view.
*   `GET /api/leaderboard`: Returns leaderboard data as JSON (for potential frontend apps).

---
