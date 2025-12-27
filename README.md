# egg is an egg timer a cosy fun website for me to learn
## structure (mvc)
- data
    - revipes.json
    - users.json
- models
    - animationModel.js
    - recipeModel.js
    - userModel.js
- view
    - home.ejs
    - menu.ejs
    - recipe.ejs
    - parts
        - header.ejs
        - login.ejs
        - lose.ejs
        - timer.ejs
- control
    - authController.js
    - recipeController.js
    - timerController.js
- public
    - style.css


## Known Issues & Fixes
- **Timer Bug (Fixed)**: The timer used to fail when navigating between pages (PJAX) if music was playing or if the user navigated back and forth.
    - **Cause**: The `timer.js` script declared variables (`let seconds`, etc.) in the global scope. When PJAX re-loaded the script on navigation, it tried to re-declare these variables, causing a "Identifier has already been declared" error.
    - **Fix**: Wrapped the timer logic in an IIFE (Immediately Invoked Function Expression) `(function() { ... })();` to create a private scope for each execution.