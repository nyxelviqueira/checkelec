const sqlite3 = require("sqlite3").verbose();
const { scrapeAll } = require("./data/scrapeAll");

let db = new sqlite3.Database("./db/my_database.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the my_database database.");
});

async function updateDatabase() {
  let intentos = 0;
  let apiData;
  let success = false;

  while (intentos < 3 && !success) {
    try {
      const currentDate = new Date().toDateString();
      apiData = await scrapeAll();
      console.log("apiData:", apiData);

      // Primero eliminamos las entradas antiguas
      db.run("DELETE FROM data WHERE date != ?", currentDate, (err) => {
        if (err) {
          console.error(err.message);
        }
      });

      // Luego insertamos los nuevos datos
      db.run(
        "INSERT INTO data (date, apiData) VALUES (?, ?)",
        currentDate,
        JSON.stringify(apiData),
        (err) => {
          if (err) {
            console.error(err.message);
          }
        }
      );

      success = true;
    } catch (scrapeError) {
      // Manejo de error del scraping
      console.error("Error en la función scrapeAll:", scrapeError);
      intentos++;

      // Esperar 1 minuto antes de intentar nuevamente
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }

  if (!success) {
    // Si después de 3 intentos aún falla enviamos una notificación
    console.error("Scraping failed after 3 attempts.");
  }
}

// Exporta db y updateDatabase para que se pueda usar en otros archivos
module.exports = { db, updateDatabase };
