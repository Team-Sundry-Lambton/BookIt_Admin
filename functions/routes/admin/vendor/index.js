const express = require('express')
let app = express.Router()
const path = require('path');
const rootFolder = process.cwd();
const {
  getAllVendors,
  deleteVendor
} = require(path.join(rootFolder, "/controllers/admin/vendorController"));


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

app.get('/',isLoggedIn, async (req,res) =>{
  var adminUser = req.session.user;
  var currentUrl = req.originalUrl;
  var page = parseInt(req.query.page) || 1;
  var limit = parseInt(req.query.limit) || global.perPage;
  const data = await getAllVendors(limit,page);

  res.render('./admin/vendor/index',{
      adminUser, 
      currentUrl, 
      pageName: "Vendor",
      title: global.title,
      breadcrumbs: req.breadcrumbs,
      data: data.results,
      total: data.totalCount,
      next: data.next,
      pages: Math.ceil(data.totalCount / limit),
      currentPage: page,
      nextPage: page+1,
      prevPage: page-1
  });
});

app.post('/delete', isLoggedIn, deleteVendor);

  

module.exports = app