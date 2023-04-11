const express = require('express')
let app = express.Router()
const path = require('path');
const rootFolder = process.cwd();
const {
  getBooking,
  updateBooking
} = require(path.join(rootFolder, "/controllers/admin/bookingController"));

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
  
app.get('/:id', isLoggedIn, async (req,res) =>{
    var adminUser = req.session.user;
    var currentUrl = req.originalUrl;
    const id = req.params.id;
    var data = await getBooking(id);
    var vendors = await getListVendors();
    var clients = await getListClients();
    res.render('./admin/booking/edit',{
        adminUser, 
        currentUrl, 
        pageName: "Edit booking",
        title: global.title,
        breadcrumbs: req.breadcrumbs,
        bookingId: id,
        data: data[0],
        vendors,
        clients
    });
});

app.post('/', isLoggedIn, updateBooking);

module.exports = app
