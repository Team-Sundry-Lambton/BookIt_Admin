const express = require('express')
let app = express.Router()
const admin = require('firebase-admin');

app.get('/', async (request,response) =>{
    response.render("index")
  });

module.exports = app
