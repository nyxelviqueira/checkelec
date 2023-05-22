const { chromium } = require("playwright");

const SELECTOR_CONECTA = "div.value";
const SELECTOR_ONE_LUZ = "div.value";
const SELECTOR_ONE_LUZ3 = "div.value";

async function Endesa() {
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
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });

      for (const [key, selector] of Object.entries(selectors)) {
        await page.waitForSelector(selector);
        await page.waitForTimeout(1000);

        const data = await page.$$eval(selector, (elements) =>
          elements.map((el) => el.innerText)
        );

        const prices = [...data];
        prices.shift();

        const pricesDecimals = prices.map((price) =>
          parseFloat(price.replace(",", "."))
        );

        console.log("Endesa", pricesDecimals);

        if (key === "planConecta") {
          result.precio_potencia_conecta_P1 = pricesDecimals[0] / 365;
          result.precio_potencia_conecta_P2 = pricesDecimals[1] / 365;
          result.precio_energia_conecta = pricesDecimals[2];
          result.url_plan_conecta = url;
        } else if (key === "tarifaOne") {
          result.precio_potencia_one_P1 = pricesDecimals[0] / 365;
          result.precio_potencia_one_P2 = pricesDecimals[1] / 365;
          result.precio_tarifa_one = pricesDecimals[2];
          result.url_tarifa_one = url;
        } else if (key === "tarifaOne3") {
          result.precio_potencia_one3_P1 = pricesDecimals[0] / 365;
          result.precio_potencia_one3_P2 = pricesDecimals[1] / 365;
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
