const puppeteer = require("puppeteer");

const SELECTOR_CONECTA = "div.value";
const SELECTOR_ONE_LUZ = "div.value";
const SELECTOR_ONE_LUZ3 = "div.value";

async function Endesa() {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const result = {};

    const urlsAndSelectors = [
      {
        url: "https://www.endesa.com/es/luz-y-gas/luz/conecta-de-endesa",
        selectors: {
          planConecta: SELECTOR_CONECTA,
        },
      },
      {
        url: "https://www.endesa.com/es/luz-y-gas/luz/one/tarifa-one-luz",
        selectors: {
          tarifaOne: SELECTOR_ONE_LUZ,
        },
      },
      {
        url: "https://www.endesa.com/es/luz-y-gas/luz/one/tarifa-one-luz-3periodos",
        selectors: {
          tarifaOne3: SELECTOR_ONE_LUZ3,
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
        const data = await page.$$eval(selector, (elements) => {
          return elements.map((el) => el.innerText);
        });

        const prices = [...data];
        prices.shift();

        const pricesDecimals = prices.map((price) =>
          parseFloat(price.replace(",", "."))
        );

        // Asigna los precios a las variables correspondientes
        if (key === "planConecta") {
          result.precio_potencia_conecta_P1 = pricesDecimals[0] / 12;
          result.precio_potencia_conecta_P2 = pricesDecimals[1] / 12;
          result.precio_energia_conecta = pricesDecimals[2];
          result.url_plan_conecta = url;
        } else if (key === "tarifaOne") {
          result.precio_potencia_one_P1 = pricesDecimals[0] / 12;
          result.precio_potencia_one_P2 = pricesDecimals[1] / 12;
          result.precio_tarifa_one = pricesDecimals[2];
          result.url_tarifa_one = url;
        } else if (key === "tarifaOne3") {
          result.precio_potencia_one3_P1 = pricesDecimals[0] / 12;
          result.precio_potencia_one3_P2 = pricesDecimals[1] / 12;
          result.precio_Punta = pricesDecimals[2];
          result.precio_Llano = pricesDecimals[3];
          result.precio_Valle = pricesDecimals[4];
          result.url_tarifa_one3 = url;
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

module.exports = Endesa;
