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

async function getLeaderboardJson(req, res) {
  try {
    const leaderboardData = await StatsModel.getLeaderboard();
    // Also return current user info if logged in, to help frontend identify "me"
    const currentUser = res.locals.user ? { id: res.locals.user.id } : null;
    res.json({ leaderboard: leaderboardData, currentUser });
  } catch (err) {
    console.error("Error fetching leaderboard JSON:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function showEggMaster(req, res) {
  try {
    const leaderboard = await StatsModel.getLeaderboard();
    const eggMaster = leaderboard.length > 0 ? leaderboard[0] : null;
    res.render("egg-master", { eggMaster }); // We will create this view next
  } catch (err) {
    console.error("Error fetching Egg Master:", err);
    res.status(500).render("errors/500");
  }
}

module.exports = {
  recordStat,
  showLeaderboard,
  getLeaderboardJson,
  showEggMaster
};
