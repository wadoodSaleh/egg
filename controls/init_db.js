const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDb() {
  // Try connecting without database first to create it
  const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: '', 
    multipleStatements: true
  };

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log("Connected to MySQL server.");

    const schemaPath = path.join(__dirname, '../data/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    // Ensure database exists and is selected
    await connection.query('CREATE DATABASE IF NOT EXISTS egg_db');
    await connection.query('USE egg_db');

    // Drop tables if they exist to ensure clean state
    await connection.query('DROP VIEW IF EXISTS leaderboard');
    await connection.query('DROP TABLE IF EXISTS stats');
    await connection.query('DROP TABLE IF EXISTS recipes');
    await connection.query('DROP TABLE IF EXISTS users');

    await connection.query(schemaSql);
    console.log("Schema applied successfully.");

  } catch (err) {
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("Access denied. Please check your MySQL root password.");
      console.error("Edit 'models/db.js' and this script with the correct credentials.");
    } else {
      console.error("Error initializing database:", err);
    }
  } finally {
    if (connection) await connection.end();
  }
}

initDb();
