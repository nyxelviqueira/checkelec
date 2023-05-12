const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("myDatabase.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the SQLite database.");
});

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS data (date TEXT, apiData TEXT)", (err) => {
    if (err) {
      console.error(err.message);
    }
  });
});

module.exports = db;
