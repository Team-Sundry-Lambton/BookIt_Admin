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
global.perPage = 30;

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


app.use("/index", indexRouter);
app.use("/admin", loginRouter);
app.use("/admin/login", loginRouter);
app.use("/admin/register", registerRouter);
app.use("/admin/profile", adminProfileRouter);
app.use("/admin/change-password", adminChangPasswordRouter);
app.use("/admin/dashboard", adminDashboardRouter);

//category page
const adminCategoryRouter = require("./routes/admin/category/index");
const adminAddCategoryRouter = require("./routes/admin/category/add");
const adminEditCategoryRouter = require("./routes/admin/category/edit");
app.use("/admin/category/index", adminCategoryRouter);
app.use("/admin/category/add", adminAddCategoryRouter);
app.use("/admin/category/edit", adminEditCategoryRouter);

//admin page
const adminAdminRouter = require("./routes/admin/admin/index");
const adminAddAdminRouter = require("./routes/admin/admin/add");
const adminEditAdminRouter = require("./routes/admin/admin/edit");
app.use("/admin/admin/index", adminAdminRouter);
app.use("/admin/admin/add", adminAddAdminRouter);
app.use("/admin/admin/edit", adminEditAdminRouter);

//service page
const adminServiceRouter = require("./routes/admin/service/index");
const adminAddServiceRouter = require("./routes/admin/service/add");
const adminEditServiceRouter = require("./routes/admin/service/edit");
app.use("/admin/service/index", adminServiceRouter);
app.use("/admin/service/add", adminAddServiceRouter);
app.use("/admin/service/edit", adminEditServiceRouter);

//vendor page
const adminVendorRouter = require("./routes/admin/vendor/index");
const adminAddVendorRouter = require("./routes/admin/vendor/add");
const adminEditVendorRouter = require("./routes/admin/vendor/edit");
app.use("/admin/vendor/index", adminVendorRouter);
app.use("/admin/vendor/add", adminAddVendorRouter);
app.use("/admin/vendor/edit", adminEditVendorRouter);

//client page
const adminClientRouter = require("./routes/admin/client/index");
const adminAddClientRouter = require("./routes/admin/client/add");
const adminEditClientRouter = require("./routes/admin/client/edit");
app.use("/admin/client/index", adminClientRouter);
app.use("/admin/client/add", adminAddClientRouter);
app.use("/admin/client/edit", adminEditClientRouter);

//booking page
const adminBookingRouter = require("./routes/admin/booking/index");
const adminAddBookingRouter = require("./routes/admin/booking/add");
const adminEditBookingRouter = require("./routes/admin/booking/edit");
const adminInvoiceRouter = require("./routes/admin/booking/invoice");
app.use("/admin/booking/index", adminBookingRouter);
app.use("/admin/booking/add", adminAddBookingRouter);
app.use("/admin/booking/edit", adminEditBookingRouter);
app.use("/admin/booking/invoice", adminInvoiceRouter);


// add breadcrumbs
get_breadcrumbs = function(url) {
  var rtn = [{name: "HOME", url: "/admin/dashboard"}],
      acc = "", // accumulative url
      arr = url.substring(1).split("/");

  for (i=0; i<arr.length; i++) {
    if(arr[i].toUpperCase() != "ADMIN"){
      acc = i != arr.length-1 ? acc+"/"+arr[i] : null;
      var name = arr[i].toUpperCase().replace('-', ' ');
      if (name.includes("?")) {
        name = name.substring(0, name.indexOf("?"));
      }
      rtn[i+1] = {name: name, url: ''};
      // rtn[i+1] = {name: arr[i].toUpperCase().replace('-', ' '), url: acc};
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