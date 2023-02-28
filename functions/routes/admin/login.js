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
    res.redirect('/admin/profile');
  } else {
    const errorMsg = "Invalid username or password";
    res.render('login',{errorMsg});
  }
});

async function loginData(req){
  const {email, password} = req.body;
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
        return true; // Login successful
      } else {
        return false; // Incorrect password
      }
    } else {
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
