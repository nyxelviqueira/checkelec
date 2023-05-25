const { chromium } = require("playwright");

const SELECTOR_USO_LUZ = "#TarifaporUsoLuz .precio";
const SELECTOR_NOCHE = "#TarifaNocheLuz .precio";

async function Naturgy() {
  function extractNumber(priceString) {
    const match = priceString.match(/(\d+(,\d+)?)/);
    if (match) {
      const numberAsString = match[0].replace(",", ".");
      return parseFloat(numberAsString);
    }
    return null;
  }
  try {
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext({
      // Desactiva la descarga de imágenes, hojas de estilo y fuentes
      fetchOptions: {
        types: ["image", "stylesheet", "font"],
        action: "block",
      },
    });

    const page = await context.newPage();
    const result = {};

    const ivaSwitch = '.switchIva input[type="checkbox"]';
    const descuentoSwitch = '.switchDesc input[type="checkbox"]';

    const urlsAndSelectors = [
      {
        url: "https://www.naturgy.es/hogar/luz/tarifa_por_uso_luz",
        selector: SELECTOR_USO_LUZ,
      },
      {
        url: "https://www.naturgy.es/hogar/luz/tarifa_noche",
        selector: SELECTOR_NOCHE,
      },
    ];

    for (const { url, selector } of urlsAndSelectors) {
      // Navega a la página web
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });

      // Cambia el estado del checkbox de impuestos (IVA)
      await page.evaluate((ivaSwitch) => {
        const checkbox = document.querySelector(ivaSwitch);
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
        }
      }, ivaSwitch);

      // Cambia el estado del checkbox de descuentos
      await page.evaluate((descuentoSwitch) => {
        const checkbox = document.querySelector(descuentoSwitch);
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
        }
      }, descuentoSwitch);

      // Extrae los precios de todos los elementos que coinciden con el selector
      const prices = await page.$$eval(selector, (elements) => {
        return elements.map((el) => el.innerText);
      });

      console.log("Naturgy", prices);

      // Asigna los precios a las variables correspondientes
      if (url === "https://www.naturgy.es/hogar/luz/tarifa_por_uso_luz") {
        result.precio_potencia_P1 = extractNumber(prices[0]) / 30.41;
        result.precio_potencia_P2 = extractNumber(prices[1]) / 30.41;
        result.precio_energia = extractNumber(prices[2]);
        result.url_por_uso_luz = url;
      } else if (url === "https://www.naturgy.es/hogar/luz/tarifa_noche") {
        result.precio_potencia_noche_P1 = extractNumber(prices[0]) / 30.41;
        result.precio_potencia_noche_P2 = extractNumber(prices[1]) / 30.41;
        result.precio_Punta = extractNumber(prices[2]);
        result.precio_Llano = extractNumber(prices[3]);
        result.precio_Valle = extractNumber(prices[4]);
        result.url_noche = url;
      }
    }
    await browser.close();
    return result;
  } catch (error) {
    console.error(error);
    return {};
  }
}

module.exports = Naturgy;
