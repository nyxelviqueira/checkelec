const puppeteer = require("puppeteer");

const SELECTOR = "#precios-luz .tabla-total-energies .blogview";
const SELECTOR_DH =
  "#tabla-precios-a-tu-aire-luz-ahorro .tabla-total-energies td";

async function Total() {
  function extractNumber(priceString) {
    const match = priceString.match(/(\d+(,\d+)?)/);
    if (match) {
      const numberAsString = match[0].replace(",", ".");
      return parseFloat(numberAsString);
    }
    return null;
  }
  try {
    const result = {};

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const urlsAndSelectors = [
      {
        url: "https://www.totalenergies.es/es/hogares/tarifas-luz/a-tu-aire-siempre",
        selector: SELECTOR,
      },
      {
        url: "https://www.totalenergies.es/es/hogares/tarifas-luz/a-tu-aire-programa-tu-ahorro",
        selector: SELECTOR_DH,
      },
    ];

    for (const { url, selector } of urlsAndSelectors) {
      // Navega a la página web
      await page.goto(url);

      // Espera a que el elemento que contiene el precio esté cargado en la página
      await page.waitForSelector(selector);

      // Espera a que el precio se actualice
      await page.waitForTimeout(1000); // Ajusta el tiempo de espera según sea necesario

      // Extrae los precios de todos los elementos que coinciden con el selector
      const data = await page.$$eval(selector, (elements) => {
        return elements.map((el) => el.innerText);
      });

      const prices = data.slice(1, 6);

      // Asigna los precios a las variables correspondientes
      if (
        url ===
        "https://www.totalenergies.es/es/hogares/tarifas-luz/a-tu-aire-siempre"
      ) {
        result.precio_potencia_P1 = extractNumber(prices[0]) * 30.41;
        result.precio_potencia_P2 = extractNumber(prices[0]) * 30.41;
        result.precio_energia = extractNumber(prices[1]);
        result.url_aire = url;
      } else if (
        url ===
        "https://www.totalenergies.es/es/hogares/tarifas-luz/a-tu-aire-programa-tu-ahorro"
      ) {
        result.precio_potencia_noche_P1 = extractNumber(prices[0]) * 30.41;
        result.precio_potencia_noche_P2 = extractNumber(prices[1]) * 30.41;
        result.precio_Punta = extractNumber(prices[2]);
        result.precio_Llano = extractNumber(prices[3]);
        result.precio_Valle = extractNumber(prices[4]);
        result.url_DH = url;
      }
    }
    await browser.close();
    return result;
  } catch (error) {
    console.error(error);
    return {};
  }
}

module.exports = Total;
