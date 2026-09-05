const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.send("Topup Center is Live!");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
