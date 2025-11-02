#!/usr/bin/env node

/**
 * Database Update Script for Mental Health Platform
 * This script applies all schema updates in the correct order
 */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
  white: "\x1b[37m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Load environment variables
require("dotenv").config();

const config = {
  host: process.env.DB_HOST || process.env.DATABASE_HOST || "localhost",
  port: process.env.DB_PORT || process.env.DATABASE_PORT || 5432,
  database:
    process.env.DB_NAME || process.env.DATABASE_NAME || "mental_health_db",
  user: process.env.DB_USER || process.env.DATABASE_USER || "postgres",
  password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || "",
};

log("================================================", "cyan");
log("Mental Health Platform - Database Update Script", "cyan");
log("================================================", "cyan");
log("");

log("Database Configuration:", "cyan");
log(`  Host: ${config.host}`, "white");
log(`  Port: ${config.port}`, "white");
log(`  Database: ${config.database}`, "white");
log(`  User: ${config.user}`, "white");
log("");

// Create database connection pool
const pool = new Pool(config);

/**
 * Execute a SQL file
 */
async function executeSQLFile(filePath, description) {
  log(`Applying: ${description}`, "yellow");
  log(`  File: ${filePath}`, "gray");

  if (!fs.existsSync(filePath)) {
    log("  SKIPPED: File not found", "yellow");
    return { status: "skipped" };
  }

  try {
    const sql = fs.readFileSync(filePath, "utf8");
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");
      log("  SUCCESS", "green");
      return { status: "success" };
    } catch (error) {
      await client.query("ROLLBACK");
      log(`  ERROR: ${error.message}`, "red");
      return { status: "error", error };
    } finally {
      client.release();
    }
  } catch (error) {
    log(`  ERROR: ${error.message}`, "red");
    return { status: "error", error };
  }
}

/**
 * Ask user for input
 */
function question(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${prompt}${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Main update process
 */
async function updateDatabase() {
  log("Starting database update process...", "cyan");
  log("");

  // Define the order of SQL files to execute
  const sqlFiles = [
    { path: "./database/schema.sql", description: "Core Database Schema" },
    {
      path: "./database/add_gamification.sql",
      description: "Gamification Tables",
    },
    {
      path: "./database/add_streaks.sql",
      description: "Streak Tracking System",
    },
    { path: "./database/add_challenges.sql", description: "Challenges System" },
    {
      path: "./database/add_achievements.sql",
      description: "Achievements System",
    },
    { path: "./database/add_levels.sql", description: "Wellness Levels" },
    {
      path: "./database/add_activity_types.sql",
      description: "Activity Types",
    },
    {
      path: "./database/add_support_context.sql",
      description: "Support Context",
    },
    {
      path: "./database/add_assessment_fields.sql",
      description: "Assessment Fields",
    },
    {
      path: "./database/add_user_profile_fields.sql",
      description: "User Profile Fields",
    },
    {
      path: "./backend/database/migrations/001_add_onboarding_columns.sql",
      description: "Onboarding Columns Migration",
    },
  ];

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  // Execute each SQL file
  for (const file of sqlFiles) {
    const result = await executeSQLFile(file.path, file.description);

    if (result.status === "success") {
      successCount++;
    } else if (result.status === "error") {
      failCount++;
    } else {
      skipCount++;
    }

    log("");
  }

  // Ask about seed data
  const applySeed = await question("Do you want to apply seed data? (Y/N): ");

  if (applySeed.toLowerCase() === "y") {
    log("");
    const seedResult = await executeSQLFile(
      "./database/gamification_seed.sql",
      "Gamification Seed Data"
    );
    if (seedResult.status === "success") {
      successCount++;
    } else if (seedResult.status === "error") {
      failCount++;
    }
  }

  // Print summary
  log("");
  log("================================================", "cyan");
  log("Database Update Complete!", "cyan");
  log("================================================", "cyan");
  log(`  Successful: ${successCount}`, "green");
  log(`  Failed: ${failCount}`, "red");
  log(`  Skipped: ${skipCount}`, "yellow");
  log("");

  if (failCount > 0) {
    log("Some migrations failed. Please review the errors above.", "red");
    process.exit(1);
  } else {
    log("All migrations applied successfully!", "green");
    log("");
    log("Next steps:", "cyan");
    log("  1. Start the backend server: cd backend && npm run dev", "white");
    log("  2. Start the AI service: cd ai-services && python main.py", "white");
    log("  3. Start the frontend: cd frontend && npm run dev", "white");
    log("");
    process.exit(0);
  }
}

// Test database connection before starting
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    log("ERROR: Could not connect to database", "red");
    log(`Details: ${err.message}`, "red");
    log("");
    log("Please check your database configuration in .env file", "yellow");
    process.exit(1);
  } else {
    log("Database connection successful!", "green");
    log("");

    // Start the update process
    updateDatabase()
      .catch((error) => {
        log(`FATAL ERROR: ${error.message}`, "red");
        process.exit(1);
      })
      .finally(() => {
        pool.end();
      });
  }
});
