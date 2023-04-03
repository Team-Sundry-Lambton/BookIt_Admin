const express = require('express')
let app = express.Router()
const admin = require('firebase-admin');
const bcrypt = require("bcryptjs")
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

app.get('/', function (req, res) {
  res.render("./admin/login",{
    pageName: "Login",
    title: global.title
  })
});

app.post('/', async (req, res) => {
  const isLoggedIn = await loginData(req);
  if (isLoggedIn) {
    //res.redirect('/admin/dashboard');
    res.redirect('/admin/category/index');
  } else {
    const errorMsg = "Invalid username or password";
    res.render('./admin/login',{
      errorMsg,
      pageName: "Login",
      title: global.title
    });
  }
});

async function loginData(req){
  const {email, password} = req.body;
  //console.log("email:", email);
  try {
    const querySnapshot = await adminsCollection.where('email', '==', email).get();
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      // Compare the hashed password with the stored hash
      const storedHash = userDoc.data().password;
      const passwordMatch = await bcrypt.compare(password, storedHash);
      if (passwordMatch) {
        // Create session
        req.session.user = userDoc.data();
        console.log("Login successful");
        return true; // Login successful
      } else {
        console.log("Incorrect password");
        return false; // Incorrect password
      }
    } else {
      console.log("User not found");
      return false; // User not found
    }
  } catch (error) {
    console.error(error);
    return false; // Error occurred
  }
  
}

app.get('/logout', function (req, res) {
  delete req.session.user;
  res.redirect("/admin/login");
});
module.exports = app
