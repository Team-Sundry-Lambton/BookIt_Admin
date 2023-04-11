const express = require('express')
let app = express.Router()
const path = require('path');
const rootFolder = process.cwd();
const {
  getAllServices,
  deleteService,
  approveService
} = require(path.join(rootFolder, "/controllers/admin/serviceController"));

const {
  getListVendors
} = require(path.join(rootFolder, "/controllers/admin/vendorController"));

const {
  getListCategories
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

app.get('/',isLoggedIn, async (req,res) =>{
  var adminUser = req.session.user;
  var currentUrl = req.originalUrl;

  var searchByVendor = req.query.vendor || "";
  if(searchByVendor == "all"){
    searchByVendor = "";
  }

  var searchByCategory = req.query.category || "";
  if(searchByCategory == "all"){
    searchByCategory = "";
  }

  var searchByStatus = req.query.status || "";
  if(searchByStatus == "all"){
    searchByStatus = "";
  }
  var page = parseInt(req.query.page) || 1;
  var limit = parseInt(req.query.limit) || global.perPage;
  const data = await getAllServices(searchByVendor, searchByCategory, searchByStatus, limit, page);
  const vendors = await getListVendors();
  const categories = await getListCategories();
  
  res.render('./admin/service/index',{
      adminUser, 
      currentUrl, 
      pageName: "Services",
      title: global.title,
      breadcrumbs: req.breadcrumbs,
      searchByVendor: searchByVendor,
      searchByCategory: searchByCategory,
      searchByStatus: searchByStatus,
      vendors: vendors,
      categories: categories,
      data: data.results,
      total: data.totalCount,
      next: data.next,
      pages: Math.ceil(data.totalCount / limit),
      currentPage: page,
      nextPage: page+1,
      prevPage: page-1
  });
});

app.post('/delete', isLoggedIn, deleteService);
app.post('/approve', isLoggedIn, approveService);

  

module.exports = app