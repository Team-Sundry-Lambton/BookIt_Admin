const express = require("express");
const app = express.Router();

app.get("/", async (request, response) => {
  response.render("index");
});

module.exports = app;
