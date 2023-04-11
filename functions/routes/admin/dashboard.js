const express = require('express')
let app = express.Router()
const session = require('cookie-session');
app.use(session({
  name: 'session',
  keys: ['yourSecretKey'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
// Middleware to check if the user is logged in

const isLoggedIn = (req, res, next) => {
    res.setHeader('Cache-Control', 'private');
    console.log("user:", req.session);
    if (req.session.user) {
      console.log("go to 1");
      next();
    } else {
      console.log("go to 2");
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
    res.render('./admin/dashboard',{
      adminUser, 
      currentUrl, 
      pageName: "Dashboard",
      title: global.title,
      breadcrumbs: req.breadcrumbs
    });
  });
  

module.exports = app
