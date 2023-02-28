const express = require('express')
let app = express.Router()
const admin = require('firebase-admin');
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

            return res.send('Updated profile successfully');

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


  const multer  = require('multer')
  var bodyParser = require('body-parser');
  // Create application/x-www-form-urlencoded parser
  var urlencodedParser = bodyParser.urlencoded({ extended: false })


  var storage = multer.diskStorage({

    destination: function (req, file, cb) {
  
      cb(null, '/filepath')
    },
  
  
    filename: function (req, file, cb) {
  
      let filename = 'filenametogive';
       req.body.file = filename
  
      cb(null, filename)
    }
  })
  
  var upload = multer({ storage: storage })

  // For Single image upload
  /* app.post('/change-photo', imageUpload.single('avatar'), (req, res, next) => {
    const file = req.file;
    if (!file) {
      const error = new Error("Please upload a file");
      error.httpStatusCode = 400;
      console.log('Route handler error:', error);
      return next(error);
    }
    res.send(file);
    console.log("Success", req.file);
  }); */


  app.post('/change-photo', upload.single('avatar'), (req, res, next) => {
    // get the temporary location of the file
    console.log(req.file);
    console.log(req.body.file);
    
    console.log(req.files);
    var tmp_path = req.files.avatar.path;
    // set where the file should actually exists 
    var target_path = './uploads' + req.files.avatar.name;
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) {
                throw err;
            }else{
                    var profile_pic = req.files.avatar.name;
                    //use profile_pic to do other stuffs like update DB or write rendering logic here.
             };
            });
        });
});
  

module.exports = app
