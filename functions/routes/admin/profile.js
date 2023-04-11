const express = require('express')
let app = express.Router()
const admin = require('firebase-admin');
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
    res.render('./admin/profile',{
      adminUser, 
      currentUrl, 
      pageName: "Profile",
      title: global.title,
      breadcrumbs: req.breadcrumbs
    });
  });

  app.post('/', isLoggedIn, async (req, res) => {
    var adminUser = req.session.user;
    if (adminUser) {
      var email = req.session.user.email;
      try {
        const {firstname, lastname, phone} = req.body;
        const querySnapshot = await adminsCollection.where('email', '==', email).get();
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const docRef = doc.ref;
          await docRef.update({ firstname: firstname, lastname: lastname, phone: phone });

          // Create session
          const querySnapshotUpdated = await adminsCollection.where('email', '==', email).get();
          const docUpdated = querySnapshotUpdated.docs[0];
          adminUser = docUpdated.data();
          req.session.user = adminUser;
          //return res.send('Updated profile successfully');
        }
        res.redirect('/admin/profile');
      } catch (error) {
        console.error(error);
        return res.status(500).send('An error occurred while updating the profile');
      }
    } else {
      res.redirect('/admin/login');
    }
  });
  var bodyParser = require('body-parser');
  // Create application/x-www-form-urlencoded parser
  var urlencodedParser = bodyParser.urlencoded({ extended: false })
  const multer  = require('multer')
  const upload = multer({ dest: 'uploads/' })
  app.post('/change-photo',upload.fields([
    { name: 'avatar', maxCount: 3 }
  ]), function (req, res) {
    // req.file is the name of your file in the form above, here 'uploaded_file'
    // req.body will hold the text fields, if there were any 
    console.log("Shin")
    console.log(req.file, req.body)
  });


module.exports = app
