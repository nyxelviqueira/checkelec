const express = require("express");
const app = express();
const cors = require("cors");
const { scrapeAll } = require("./data/scrapeAll");
const db = require("./db");

app.use(cors());

app.get("/api/data", async (req, res) => {
  try {
    const currentDate = new Date().toDateString();
    db.get(
      "SELECT * FROM data WHERE date = ?",
      currentDate,
      async (err, row) => {
        if (err) {
          console.error(err.message);
          res.status(500).json({ message: "Error al obtener los datos" });
          return;
        }

        if (row) {
          res.json(JSON.parse(row.apiData));
        } else {
          const apiData = await scrapeAll();
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
          res.json(apiData);
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los datos" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
