const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());

//Load JSON file
const data = JSON.parse(fs.readFileSync("./data/globalpricebook.json"));

app.get("/", (req, res) => {
  res.send("Server is running!");
});


//Get all countries for dropdown
app.get("/countries", function (req, res) {
  const countries = [...new Set(data.map(function (item) {
    return item.Country;
  }))];
  res.json(countries);
});

//Endpoint to get data for a specific country
app.get("/country/:name", function (req, res) {
  const countryName = req.params.name.toLowerCase();

  //Filter the JSON data for the selected country
  const countryData = data.filter(item => item.Country.toLowerCase() === countryName);

  if (countryData.length === 0) {
    return res.status(404).json({ error: "Country not found" });
  }
  res.json(countryData);
});

const PORT = 5000;
app.listen(PORT, function () {
  console.log("Server running on http://localhost:" + PORT);
});
