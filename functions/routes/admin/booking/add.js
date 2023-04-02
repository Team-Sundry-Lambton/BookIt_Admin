const express = require('express')
let app = express.Router()
const session = require('express-session');
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set secure: true if using HTTPS
    maxAge: 3600000 // Set the session to expire in 1 hour
  } 
}));
const path = require('path');
const rootFolder = process.cwd();
const {
  getListCategories,
} = require(path.join(rootFolder, "/controllers/admin/categoryController"));


// Middleware to check if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
      next();
    } else {
      res.redirect('/admin/login');
    }
  };

app.use(function(req, res, next) {
  req.breadcrumbs = get_breadcrumbs(req.originalUrl);
  next();
});
  
app.get('/', isLoggedIn, async (req,res) =>{
  var adminUser = req.session.user;
  var currentUrl = req.originalUrl;
  res.render('./admin/category/add',{
      adminUser, 
      currentUrl, 
      pageName: "Add Category",
      title: global.title,
      breadcrumbs: req.breadcrumbs
  });
});


module.exports = app
