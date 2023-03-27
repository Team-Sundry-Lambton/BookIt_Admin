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
    getAdmin,
    updateAdmin
} = require(path.join(rootFolder, "/controllers/admin/adminController"));


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
    var admin = await getAdmin(id);
    console.log(admin);
    res.render('./admin/admin/edit',{
        adminUser, 
        currentUrl, 
        pageName: "Edit Category",
        title: global.title,
        breadcrumbs: req.breadcrumbs,
        adminId: id,
        admin
    });
});

app.post('/', isLoggedIn, updateAdmin);

module.exports = app
