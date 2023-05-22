const { chromium } = require("playwright");

const SELECTOR = "#precios-luz .tabla-total-energies .blogview";
const SELECTOR_DH =
  "#tabla-precios-a-tu-aire-luz-ahorro .tabla-total-energies td";

async function Total() {
  try {
    const result = {};

    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext({
      // Disable downloading of images, stylesheets, and fonts
      fetchOptions: {
        types: ["image", "stylesheet", "font"],
        action: "block",
      },
    });

    const page = await context.newPage();

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
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });

      const data = await page.$$eval(selector, (elements) => {
        return elements.map((el) => {
          const match = el.innerText.match(/(\d+(,\d+)?)/);
          if (match) {
            const numberAsString = match[0].replace(",", ".");
            return parseFloat(numberAsString);
          }
          return null;
        });
      });

      const prices = data.slice(1, 6);

      console.log("TE", prices);

      if (
        url ===
        "https://www.totalenergies.es/es/hogares/tarifas-luz/a-tu-aire-siempre"
      ) {
        result.precio_potencia_P1 = prices[0] / 2;
        result.precio_potencia_P2 = prices[0] / 2;
        result.precio_energia = prices[1];
        result.url_aire = url;
      } else if (
        url ===
        "https://www.totalenergies.es/es/hogares/tarifas-luz/a-tu-aire-programa-tu-ahorro"
      ) {
        result.precio_potencia_noche_P1 = prices[0];
        result.precio_potencia_noche_P2 = prices[1];
        result.precio_Punta = prices[2];
        result.precio_Llano = prices[3];
        result.precio_Valle = prices[4];
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
