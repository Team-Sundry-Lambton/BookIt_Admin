const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
var hbs = require('handlebars');
const app = express();
var fs = require('fs');
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine', 'hbs');
const xifHelper = require('./helpers/handlebars-helper-x');
const config = require('./config/db');
hbs.registerHelper('xif', xifHelper);
global.title = "BookIt";
app.set('views','./views');
app.set('view engine', 'hbs');

// Serve static files from the public directory
app.use(express.static('public'));
const session = require('express-session');
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure: true if using HTTPS
}));


//partials config
var partialsDir = __dirname + '/views/partials';
var filenames = fs.readdirSync(partialsDir);

filenames.forEach(function (filename) {
  var matches = /^([^.]+).hbs$/.exec(filename);
  if (!matches) {
    return;
  }
  var name = matches[1];
  var template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
  hbs.registerPartial(name, template);
});



//routes config
const indexRouter = require("./routes/index");
const loginRouter = require("./routes/admin/login");
const registerRouter = require("./routes/admin/register");
const adminProfileRouter = require("./routes/admin/profile");
const adminChangPasswordRouter = require("./routes/admin/change_password");
const adminDashboardRouter = require("./routes/admin/dashboard");

const adminCategoryRouter = require("./routes/admin/category/index");
const adminAddCategoryRouter = require("./routes/admin/category/add");
const adminEditCategoryRouter = require("./routes/admin/category/edit");


app.use("/index", indexRouter);
app.use("/admin/login", loginRouter);
app.use("/admin/register", registerRouter);
app.use("/admin/profile", adminProfileRouter);
app.use("/admin/change-password", adminChangPasswordRouter);
app.use("/admin/dashboard", adminDashboardRouter);

app.use("/admin/category/index", adminCategoryRouter);
app.use("/admin/category/add", adminAddCategoryRouter);
app.use("/admin/category/edit", adminEditCategoryRouter);


// add breadcrumbs
get_breadcrumbs = function(url) {
  var rtn = [{name: "HOME", url: "/"}],
      acc = "", // accumulative url
      arr = url.substring(1).split("/");

  for (i=0; i<arr.length; i++) {
    if(arr[i].toUpperCase() != "ADMIN"){
      acc = i != arr.length-1 ? acc+"/"+arr[i] : null;
      rtn[i+1] = {name: arr[i].toUpperCase().replace('-', ' '), url: acc};
    }
  }
  return rtn;
};

app.use(function(req, res, next) {
  req.breadcrumbs = get_breadcrumbs(req.originalUrl);
  next();
});

app.get('/', async (req,res) =>{
  res.render('index',{
    pageName: "Frontend",
    title: global.title,
  });
});

exports.app = functions.https.onRequest(app);