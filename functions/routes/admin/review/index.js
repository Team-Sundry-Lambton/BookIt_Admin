const express = require('express')
let app = express.Router()
const path = require('path');
const rootFolder = process.cwd();
const {
  getAllReviews
} = require(path.join(rootFolder, "/controllers/admin/reviewController"));

const {
  getListVendors
} = require(path.join(rootFolder, "/controllers/admin/vendorController"));
const {
  getListClients
} = require(path.join(rootFolder, "/controllers/admin/clientController"));

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

  var searchByClient = req.query.category || "";
  if(searchByClient == "all"){
    searchByClient = "";
  }
  
  console.log("searchByVendor: ", searchByVendor);
  console.log("searchByClient: ", searchByClient);

  var page = parseInt(req.query.page) || 1;
  var limit = parseInt(req.query.limit) || global.perPage;
  const data = await getAllReviews(searchByVendor, searchByClient, limit, page);
  console.log("review:", data.results);
  const vendors = await getListVendors();
  const clients = await getListClients();
  
  res.render('./admin/review/index',{
      adminUser, 
      currentUrl, 
      pageName: "Reviews",
      title: global.title,
      breadcrumbs: req.breadcrumbs,
      searchByVendor: searchByVendor,
      searchByClient: searchByClient,
      vendors: vendors,
      clients: clients,
      data: data.results,
      total: data.totalCount,
      next: data.next,
      pages: Math.ceil(data.totalCount / limit),
      currentPage: page,
      nextPage: page+1,
      prevPage: page-1
  });
});

module.exports = app