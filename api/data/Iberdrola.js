const puppeteer = require("puppeteer");

const SELECTOR_POTENCIA = ".precio-potencia span";
const SELECTOR_PLAN_ESTABLE = ".precio-hora span";
const SELECTOR_PLAN_ONLINE = ".precio-hora span";

async function Iberdrola() {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const result = {};

    const urlsAndSelectors = [
      {
        url: "https://www.iberdrola.es/luz/plan-estable",
        selectors: {
          potencia: SELECTOR_POTENCIA,
          planEstable: SELECTOR_PLAN_ESTABLE,
        },
      },
      {
        url: "https://www.iberdrola.es/luz/plan-online",
        selectors: {
          planOnline: SELECTOR_PLAN_ONLINE,
        },
      },
    ];

    for (const { url, selectors } of urlsAndSelectors) {
      // Navega a la página web
      await page.goto(url);

      for (const [key, selector] of Object.entries(selectors)) {
        // Espera a que el elemento que contiene el precio esté cargado en la página
        await page.waitForSelector(selector);

        // Espera a que el precio se actualice
        await page.waitForTimeout(1000); // Ajusta el tiempo de espera según sea necesario

        // Extrae los precios de todos los elementos que coinciden con el selector
        const prices = await page.$$eval(selector, (elements) => {
          return elements.map((el) => el.innerText);
        });

        const pricesDecimals = prices.map((price) =>
          parseFloat(price.replace(",", "."))
        );

        // Asigna los precios a las variables correspondientes
        if (key === "potencia") {
          result.precio_potencia_P1 = pricesDecimals[1] / 12;
          result.precio_potencia_P2 = pricesDecimals[0] / 12;
        } else if (key === "planEstable") {
          result.precio_plan_estable = pricesDecimals[0];
          result.url_plan_estable = url;
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
