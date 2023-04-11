const express = require('express')
let app = express.Router()
const path = require('path');
const rootFolder = process.cwd();
const {
  addCategory
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

app.post('/', isLoggedIn, addCategory);


module.exports = app
