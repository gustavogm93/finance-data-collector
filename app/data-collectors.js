const axios = require("axios");
const logger = require("./logger");

// API key from environment variable
const API_KEY = process.env.API_KEY;

/**
 * Fetch companies from USA markets (NYSE and NASDAQ)
 * @returns {Promise<Array>} - Array of company objects
 */
async function getUsaCompanies() {
  try {
    // Example using a financial API like Alpha Vantage, Financial Modeling Prep, or similar
    // You would need to replace this with the actual API you're using
    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/stock/list?apikey=${API_KEY}`
    );

    // Filter for US companies only
    const usCompanies = response.data.filter(
      (company) =>
        !company.symbol.includes(".") && // Usually US stocks don't have dots in symbols
        company.type === "stock" &&
        !company.exchange.includes("OTC") // Exclude over-the-counter stocks
    );

    logger.info(`Fetched ${usCompanies.length} USA companies`);
    return usCompanies;
  } catch (error) {
    logger.error("Error fetching USA companies:", error.message);
    return [];
  }
}

/**
 * Fetch companies from Argentina market (BCBA)
 * @returns {Promise<Array>} - Array of company objects
 */
async function getArgentinaCompanies() {
  try {
    // Fetch Argentina companies with .BA suffix
    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/symbol/available-securities?apikey=${API_KEY}`
    );

    // Filter for Argentina companies (usually with .BA suffix)
    const argentinaCompanies = response.data.filter(
      (item) => item.symbol && item.symbol.includes(".BA")
    );

    logger.info(`Fetched ${argentinaCompanies.length} Argentina companies`);

    // For each company, get more details
    const detailedCompanies = await Promise.all(
      argentinaCompanies.map(async (company) => {
        try {
          const details = await getCompanyDetails(company.symbol);
          return { ...company, ...details, countryCode: "AR" };
        } catch (error) {
          logger.warn(
            `Failed to get details for ${company.symbol}:`,
            error.message
          );
          return { ...company, countryCode: "AR" };
        }
      })
    );

    return detailedCompanies;
  } catch (error) {
    logger.error("Error fetching Argentina companies:", error.message);
    return [];
  }
}

/**
 * Fetch top 600 European companies
 * @returns {Promise<Array>} - Array of company objects
 */
async function getEuropeCompanies() {
  try {
    // You might need to make multiple API calls to different endpoints
    // for different European markets or indices

    // Example using STOXX Europe 600 index or similar
    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/symbol/available-securities?apikey=${API_KEY}`
    );

    // Filter for European exchanges (examples of suffixes)
    const europeSuffixes = [
      ".L",
      ".DE",
      ".PA",
      ".MC",
      ".MI",
      ".AS",
      ".BR",
      ".CO",
      ".HE",
      ".LS",
      ".I",
      ".ST",
      ".SW",
      ".VI",
    ];

    const europeCompanies = response.data.filter(
      (item) =>
        item.symbol &&
        europeSuffixes.some((suffix) => item.symbol.endsWith(suffix))
    );

    logger.info(`Fetched ${europeCompanies.length} European companies`);

    // For top 600, we might need to sort and limit based on market cap or other criteria
    // For each company, get more details including market cap for sorting
    const detailedCompanies = await Promise.all(
      europeCompanies.map(async (company) => {
        try {
          const details = await getCompanyDetails(company.symbol);
          return { ...company, ...details };
        } catch (error) {
          logger.warn(
            `Failed to get details for ${company.symbol}:`,
            error.message
          );
          return company;
        }
      })
    );

    // Sort by market cap (if available) and take top 600
    const sortedCompanies = detailedCompanies
      .filter((company) => company.marketCap)
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 600);

    return sortedCompanies;
  } catch (error) {
    logger.error("Error fetching European companies:", error.message);
    return [];
  }
}

/**
 * Get detailed information for a specific company
 * @param {String} symbol - Company symbol
 * @returns {Promise<Object>} - Company details
 */
async function getCompanyDetails(symbol) {
  try {
    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${API_KEY}`
    );

    if (response.data && response.data.length > 0) {
      const details = response.data[0];

      // Map country to 2-letter code
      let countryCode = "US"; // Default
      if (details.country) {
        // This is a simplified mapping - you'd want a more complete one
        const countryMap = {
          "United States": "US",
          Argentina: "AR",
          "United Kingdom": "GB",
          Germany: "DE",
          France: "FR",
          Spain: "ES",
          Italy: "IT",
          Netherlands: "NL",
        };
        countryCode = countryMap[details.country] || countryCode;
      }

      return {
        name: details.companyName,
        sector: details.sector || "Unknown",
        industry: details.industry,
        marketCap: details.mktCap,
        countryCode: countryCode,
        market: details.exchange,
      };
    }
    return {};
  } catch (error) {
    logger.warn(`Error fetching details for ${symbol}:`, error.message);
    return {};
  }
}

module.exports = {
  getUsaCompanies,
  getArgentinaCompanies,
  getEuropeCompanies,
};
