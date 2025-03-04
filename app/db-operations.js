const logger = require("./logger");

/**
 * Process companies data and store in database
 * @param {Object} pool - PostgreSQL connection pool
 * @param {Array} companies - Array of company objects
 * @param {String|null} defaultCountryCode - Default country code if not specified in company data
 */
async function processCompanies(pool, companies, defaultCountryCode = null) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const company of companies) {
      // Default values or handle missing data
      const symbol = company.symbol || "";
      const name = company.name || company.companyName || "";
      const countryCode = company.countryCode || defaultCountryCode || "US";
      const sector = company.sector || "Unknown";
      const market = company.market || getMarketFromSymbol(symbol);

      if (!symbol || !name) {
        logger.warn(
          `Skipping company with missing data: ${JSON.stringify(company)}`
        );
        continue;
      }

      // Insert or get sector ID
      const sectorResult = await client.query(
        "INSERT INTO sectors (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id",
        [sector]
      );
      const sectorId = sectorResult.rows[0].id;

      // Get country ID (should already be in the database from init-db.sql)
      const countryResult = await client.query(
        "SELECT id FROM countries WHERE code = $1",
        [countryCode]
      );

      // If country not found, log warning and continue
      if (countryResult.rows.length === 0) {
        logger.warn(
          `Country code not found in database: ${countryCode}. Skipping company: ${symbol}`
        );
        continue;
      }
      const countryId = countryResult.rows[0].id;

      // Insert or get market ID
      const marketResult = await client.query(
        "INSERT INTO markets (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id",
        [market]
      );
      const marketId = marketResult.rows[0].id;

      // Insert or update company
      await client.query(
        `INSERT INTO companies (name, symbol, country_id, sector_id, market_id) 
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (symbol) DO UPDATE SET 
         name = $1, 
         country_id = $3,
         sector_id = $4,
         market_id = $5,
         updated_at = CURRENT_TIMESTAMP`,
        [name, symbol, countryId, sectorId, marketId]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Try to guess market from symbol format
 * @param {String} symbol - Stock symbol
 * @returns {String} - Market name
 */
function getMarketFromSymbol(symbol) {
  // This is a simple heuristic and may not be accurate for all cases
  if (symbol.includes(".BA")) return "BCBA"; // Argentina
  if (symbol.includes(".L")) return "LSE"; // London
  if (symbol.includes(".DE")) return "XETRA"; // Germany
  if (symbol.includes(".PA")) return "EURONEXT"; // Paris
  if (symbol.includes(".MC")) return "IBEX"; // Madrid

  // Default to NYSE or NASDAQ for US stocks
  return symbol.length <= 4 ? "NYSE" : "NASDAQ";
}

module.exports = {
  processCompanies,
};
