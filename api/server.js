const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./db");

var corsOptions = {
  origin: function (origin, callback) {
    var whiteList = [
      "https://checkelec.ramonviqueira.com",
      "http://localhost:3000",
    ];

    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.get("/api/data", (req, res) => {
  try {
    const currentDate = new Date().toDateString();
    db.get("SELECT * FROM data WHERE date = ?", currentDate, (err, row) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ message: "Error al obtener los datos" });
        return;
      }

      if (row) {
        res.json(JSON.parse(row.apiData));
      } else {
        res.status(404).json({ message: "No data available for today" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los datos" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
