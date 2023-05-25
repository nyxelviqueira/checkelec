const { chromium } = require("playwright");

const SELECTOR_POTENCIA_ESTABLE = ".precio-potencia span";
const SELECTOR_POTENCIA_ONLINE = ".precio-potencia span";
const SELECTOR_PLAN_ESTABLE = ".precio-hora span";
const SELECTOR_PLAN_ONLINE = ".precio-hora span";

async function Iberdrola() {
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

    const urlsAndSelectors = [
      {
        url: "https://www.iberdrola.es/luz/plan-estable",
        selectors: {
          potenciaEstable: SELECTOR_POTENCIA_ESTABLE,
          planEstable: SELECTOR_PLAN_ESTABLE,
        },
      },
      {
        url: "https://www.iberdrola.es/luz/plan-online",
        selectors: {
          potenciaOnline: SELECTOR_POTENCIA_ONLINE,
          planOnline: SELECTOR_PLAN_ONLINE,
        },
      },
    ];

    for (const { url, selectors } of urlsAndSelectors) {
      // Navega a la página web
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });

      for (const [key, selector] of Object.entries(selectors)) {
        // Extrae los precios de todos los elementos que coinciden con el selector
        const prices = await page.$$eval(selector, (elements) => {
          return elements.map((el) => el.innerText);
        });

        const pricesDecimals = prices.map((price) =>
          parseFloat(price.replace(",", "."))
        );

        console.log("Iberdrola", pricesDecimals);
        // Asigna los precios a las variables correspondientes
        if (key === "potenciaEstable") {
          result.precio_potencia_estable_P1 = pricesDecimals[1] / 365;
          result.precio_potencia_estable_P2 = pricesDecimals[0] / 365;
        } else if (key === "planEstable") {
          result.precio_plan_estable = pricesDecimals[0];
          result.url_plan_estable = url;
        } else if (key === "potenciaOnline") {
          result.precio_potencia_online_P1 = pricesDecimals[1] / 365;
          result.precio_potencia_online_P2 = pricesDecimals[0] / 365;
        } else if (key === "planOnline") {
          result.precio_energia_online = pricesDecimals[0];
          result.url_plan_online = url;
        }
      }
    }

    await browser.close();

    return result;
  } catch (error) {
    console.error(error);
    return {};
  }
}

module.exports = Iberdrola;
