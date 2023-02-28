const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
var hbs = require('handlebars');
const app = express();
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine', 'hbs');
global.title = "BookIt";


app.get('/', async (req,res) =>{
  res.render('index',{
  });
});

exports.app = functions.https.onRequest(app);