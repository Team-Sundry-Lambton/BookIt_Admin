const express = require('express')
let app = express.Router()
const path = require('path');
const rootFolder = process.cwd();
const {
    getClient,
    updateClient
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
    var client = await getClient(id);
    res.render('./admin/client/edit',{
        adminUser, 
        currentUrl, 
        pageName: "Edit client",
        title: global.title,
        breadcrumbs: req.breadcrumbs,
        clientId: id,
        client
    });
});

app.post('/', isLoggedIn, updateClient);

module.exports = app
