const express = require("express");
const cron = require("node-cron");
const { Pool } = require("pg");
const {
  getUsaCompanies,
  getArgentinaCompanies,
  getEuropeCompanies,
} = require("./data-collectors");
const logger = require("./logger");
const { processCompanies } = require("./db-operations");

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Initialize database connection
const pool = new Pool({
  host: process.env.DB_HOST || "postgres",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "financeuser",
  password: process.env.DB_PASSWORD || "financepass",
  database: process.env.DB_NAME || "financedata",
});

// Basic API endpoint to check service status
app.get("/", (req, res) => {
  res.json({
    status: "running",
    message: "Finance data collector is operational",
  });
});

// Expose endpoint to trigger data collection manually
app.get("/collect", async (req, res) => {
  try {
    await collectAllData();
    res.json({
      status: "success",
      message: "Data collection triggered successfully",
    });
  } catch (error) {
    logger.error("Error triggering manual data collection:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to collect data" });
  }
});

// Function to collect data from all markets
async function collectAllData() {
  logger.info("Starting data collection process");

  try {
    // Collect USA companies
    const usaCompanies = await getUsaCompanies();
    await processCompanies(pool, usaCompanies, "US");
    logger.info(`Processed ${usaCompanies.length} USA companies`);

    // Collect Argentina companies
    const argentinaCompanies = await getArgentinaCompanies();
    await processCompanies(pool, argentinaCompanies, "AR");
    logger.info(`Processed ${argentinaCompanies.length} Argentina companies`);

    // Collect European companies
    const europeCompanies = await getEuropeCompanies();
    await processCompanies(pool, europeCompanies);
    logger.info(`Processed ${europeCompanies.length} European companies`);

    logger.info("Data collection process completed successfully");
  } catch (error) {
    logger.error("Error during data collection:", error);
  }
}

// Schedule data collection every day at 1:00 AM
cron.schedule("0 1 * * *", async () => {
  logger.info("Running scheduled data collection");
  await collectAllData();
});

// Start express server
app.listen(port, () => {
  logger.info(`Finance data collector service started on port ${port}`);

  // Run initial data collection on startup
  logger.info("Performing initial data collection on startup");
  collectAllData().catch((error) => {
    logger.error("Initial data collection failed:", error);
  });
});

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  await pool.end();
  process.exit(0);
});
