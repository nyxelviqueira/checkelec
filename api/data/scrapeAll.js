const Naturgy = require("./Naturgy");
const Repsol = require("./Repsol");
const TotalEnergies = require("./TotalEnergies");
const Endesa = require("./Endesa");
const Iberdrola = require("./Iberdrola");

const scrapeAll = async () => {
  try {
    const naturgyResult = await Naturgy();
    const repsolResult = await Repsol();
    const totalEnergiesResult = await TotalEnergies();
    const endesaResult = await Endesa();
    const iberdrolaResult = await Iberdrola();

    return {
      naturgyResult,
      repsolResult,
      totalEnergiesResult,
      endesaResult,
      iberdrolaResult,
    };
  } catch (error) {
    console.error("Error in scraping:", error);
    throw error;
  }
};

module.exports = {
  scrapeAll,
};
