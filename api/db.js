const sqlite3 = require("sqlite3").verbose();
const cron = require("node-cron");
const { scrapeAll } = require("./data/scrapeAll");

let db = new sqlite3.Database("./db/my_database.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the my_database database.");
});

async function resetDatabase() {
  db.serialize(() => {
    db.run("DROP TABLE IF EXISTS data", (err) => {
      if (err) {
        console.error(err.message);
      }
    });

    db.run(
      "CREATE TABLE IF NOT EXISTS data (date TEXT, apiData TEXT)",
      (err) => {
        if (err) {
          console.error(err.message);
        }
      }
    );
  });

  // Hacemos el scraping aquí, justo después de recrear la tabla
  let intentos = 0;
  let apiData;
  let success = false;

  while (intentos < 3 && !success) {
    try {
      const currentDate = new Date().toDateString();
      apiData = await scrapeAll();
      console.log("apiData:", apiData);

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
    }
  }

  if (!success) {
    // Si después de 3 intentos aún falla enviamos na notificación
    console.error("Scraping failed after 3 attempts.");
  }
}
// Ejecuta resetDatabase una vez para inicializar la tabla data
resetDatabase();

// Ejecuta resetDatabase cada día a medianoche
cron.schedule("0 0 * * *", resetDatabase);

// Exporta db para que se pueda usar en otros archivos
module.exports = db;
