const { chromium } = require("playwright");

const SELECTOR_AHORRO_PLUS = ".price";
const SELECTOR_DH = ".price";

async function Repsol() {
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
    const ivaSwitch = '.switch input[type="checkbox"]';

    const urlsAndSelectors = [
      {
        url: "https://www.repsol.es/particulares/hogar/luz-y-gas/tarifas/tarifa-ahorro-plus/",
        selector: SELECTOR_AHORRO_PLUS,
      },
      {
        url: "https://www.repsol.es/particulares/hogar/luz-y-gas/tarifas/tarifa-discriminacion-horaria/",
        selector: SELECTOR_DH,
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

      // Espera a que el elemento que contiene el precio esté cargado en la página
      await page.waitForSelector(selector);

      // Espera a que el precio se actualice
      await page.waitForTimeout(1000); // Ajusta el tiempo de espera según sea necesario

      // Extrae los precios de todos los elementos que coinciden con el selector
      const prices = await page.$$eval(selector, (elements) => {
        return elements.map((el) => el.innerText);
      });

      console.log("Repsol", prices);
      // Asigna los precios a las variables correspondientes
      if (
        url ===
        "https://www.repsol.es/particulares/hogar/luz-y-gas/tarifas/tarifa-ahorro-plus/"
      ) {
        result.precio_potencia_P1 = extractNumber(prices[1]);
        result.precio_potencia_P2 = extractNumber(prices[2]);
        result.precio_energia = extractNumber(prices[0]);
        result.url_ahorro = url;
      } else if (
        url ===
        "https://www.repsol.es/particulares/hogar/luz-y-gas/tarifas/tarifa-discriminacion-horaria/"
      ) {
        result.precio_potencia_DH_P1 = extractNumber(prices[3]);
        result.precio_potencia_DH_P2 = extractNumber(prices[4]);
        result.precio_Punta = extractNumber(prices[0]);
        result.precio_Llano = extractNumber(prices[1]);
        result.precio_Valle = extractNumber(prices[2]);
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

module.exports = Repsol;
