const express = require('express')
let app = express.Router()
const path = require('path');
const rootFolder = process.cwd();
const {
  getAllBookings,
  deleteBooking
} = require(path.join(rootFolder, "/controllers/admin/bookingController"));

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
  const data = await getAllBookings(searchByVendor, searchByCategory,searchByStatus, limit, page);
  const vendors = await getListVendors();
  const categories = await getListCategories();
  const pages = Math.ceil(data.totalCount / limit);
  res.render('./admin/booking/index',{
      adminUser, 
      currentUrl, 
      pageName: "Booking",
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
      pages: pages,
      currentPage: page,
      nextPage: page+1,
      prevPage: page-1
  });
});

app.post('/delete', isLoggedIn, deleteBooking);

  

module.exports = app