const db = require('./db');

class StatsModel {
  /**
   * Records a cooking attempt (cooked or burned)
   * @param {string} userId - UUID of the user
   * @param {number} recipeId - ID of the recipe
   * @param {string} outcome - 'cooked' or 'burned'
   */
  static async recordAttempt(userId, recipeId, outcome) {
    try {
      if (!['cooked', 'burned'].includes(outcome)) {
        throw new Error("Invalid outcome. Must be 'cooked' or 'burned'");
      }
      
      const query = `
        INSERT INTO stats (user_id, recipe_id, outcome) 
        VALUES (?, ?, ?)
      `;
      await db.execute(query, [userId, recipeId, outcome]);
      return true;
    } catch (err) {
      console.error("Error in StatsModel.recordAttempt:", err);
      throw err;
    }
  }

  /**
   * Retrieves the leaderboard data
   * Returns array of { username, total_cooked, total_burned, total_eggs }
   */
  static async getLeaderboard() {
    // We can query the VIEW defined in schema.sql, or write a raw query.
    // The view: SELECT username, user_id, total_cooked, total_burned FROM leaderboard
    // We'll calculate total_eggs here or in the SQL.
    // Let's modify the query to include total_eggs for convenience.
    try {
      const query = `
        SELECT 
          user_id,
          username, 
          total_cooked, 
          total_burned,
          (total_cooked + total_burned) as total_eggs
        FROM leaderboard
        ORDER BY total_cooked DESC, total_eggs DESC
      `;
      const [rows] = await db.execute(query);
      return rows;
    } catch (err) {
      console.error("Error in StatsModel.getLeaderboard:", err);
      return [];
    }
  }
}

module.exports = StatsModel;
