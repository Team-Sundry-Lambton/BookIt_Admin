const express = require('express')
let app = express.Router()
const bodyParser = require('body-parser');
const cors = require('cors');
// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
const path = require('path');
const rootFolder = process.cwd();
const {
  getBooking
} = require(path.join(rootFolder, "/controllers/admin/bookingController"));

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
    data = data[0];
    var total = 0;
    var applicationFee = parseFloat(data.service.price/100*10).toFixed(1);
    totalClient = parseFloat(data.service.price).toFixed(1);
    totalVendor = parseFloat(data.service.price).toFixed(1) - applicationFee;
    
    res.render('./admin/booking/invoice',{
        adminUser, 
        currentUrl, 
        pageName: "Invoice",
        title: global.title,
        breadcrumbs: req.breadcrumbs,
        id: data.service.serviceId,
        bookingId: id,
        data: data,
        applicationFee: applicationFee,
        totalClient: totalClient,
        totalVendor: totalVendor
    });
});

module.exports = app
