const StatsModel = require('../models/statsModel');

async function recordStat(req, res) {
  const user = res.locals.user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { recipeId, outcome } = req.body;

  if (!recipeId || !outcome) {
    return res.status(400).json({ error: "Missing recipeId or outcome" });
  }

  try {
    await StatsModel.recordAttempt(user.id, recipeId, outcome);
    console.log(`[Stats] Recorded '${outcome}' for user ${user.username} on recipe ${recipeId}`);
    return res.json({ success: true });
  } catch (err) {
    console.error("Error recording stat:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function showLeaderboard(req, res) {
  try {
    const leaderboardData = await StatsModel.getLeaderboard();
    res.render("leaderboard", { leaderboard: leaderboardData });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.render("home", { message: "Could not load leaderboard." });
  }
}

module.exports = {
  recordStat,
  showLeaderboard
};
