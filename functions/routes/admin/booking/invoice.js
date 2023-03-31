const express = require('express')
let app = express.Router()
const session = require('express-session');
const admin = require('firebase-admin');
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set secure: true if using HTTPS
    maxAge: 3600000 // Set the session to expire in 1 hour
  } 
}));
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
    var applicationFee = data.service.price/100*10;
    total = parseInt(data.service.price) + parseInt(applicationFee);
    
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
        total: total
    });
});

module.exports = app
