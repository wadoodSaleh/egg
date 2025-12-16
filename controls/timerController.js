function startTimer(req, res) {
  res.render("recipe", {
    recipe: req.recipe
  });
}