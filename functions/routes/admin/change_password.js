const express = require('express')
let app = express.Router()
const admin = require('firebase-admin');
const session = require('express-session');
const bcrypt = require("bcryptjs")

app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set secure: true if using HTTPS
    maxAge: 3600000 // Set the session to expire in 1 hour
  } 
}));
const adminsCollection = admin.firestore().collection('admins');


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

  app.get('/', isLoggedIn, async (req,res) =>{
    var adminUser = req.session.user;
    var currentUrl = req.originalUrl;
    res.render('./admin/change_password',{
        adminUser, 
        currentUrl,
        pageName: "Change Password",
        title: global.title,
        breadcrumbs: req.breadcrumbs
    });
  });

  app.post('/', isLoggedIn, async (req, res) => {
    var adminUser = req.session.user;
    if (adminUser) {
      var email = req.session.user.email;
      try {
        const {old_password, new_password, confirm_password} = req.body;
        const querySnapshot = await adminsCollection.where('email', '==', email).get();
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const hashedPassword = doc.data().password;
            const passwordMatch = await bcrypt.compare(old_password, hashedPassword);
            if (passwordMatch) {
              const docRef = doc.ref;
              const hashedNewPassword = await bcrypt.hash(new_password, 8); 
              await docRef.update({ password: hashedNewPassword });
              return res.send('Password updated successfully');
            } else {
              return res.send('Invalid password');
            }
          } else {
          return res.send('User not found');
        }
      } catch (error) {
        console.error(error);
        return res.status(500).send('An error occurred while updating the password');
      }
    } else {
      res.redirect('/admin/login');
    }
  });
  

module.exports = app
