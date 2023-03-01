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
  // addCategory,
  getAllCategories,
  // getCategory,
  // updateCategory,
  deleteCategory
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
  var data = await getAllCategories();
  res.render('./admin/category/index',{
      adminUser, 
      currentUrl, 
      pageName: "Category",
      title: global.title,
      breadcrumbs: req.breadcrumbs,
      data
  });
});

app.post('/delete', isLoggedIn, deleteCategory);

  

module.exports = app