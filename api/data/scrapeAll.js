const Naturgy = require("./Naturgy");
const Repsol = require("./Repsol");
const TotalEnergies = require("./TotalEnergies");
const Endesa = require("./Endesa");
const Iberdrola = require("./Iberdrola");

const scrapeAll = async () => {
  try {
    const results = await Promise.all([
      Naturgy(),
      Repsol(),
      TotalEnergies(),
      Endesa(),
      Iberdrola(),
    ]);

    return {
      naturgyResult: results[0],
      repsolResult: results[1],
      totalEnergiesResult: results[2],
      endesaResult: results[3],
      iberdrolaResult: results[4],
    };
  } catch (error) {
    console.error("Error in scraping:", error);
    throw error;
  }
};

module.exports = {
  scrapeAll,
};
