const express = require('express')
let app = express.Router()
const admin = require('firebase-admin');
const bcrypt = require("bcryptjs")
const session = require('cookie-session');
app.use(session({
  name: 'session',
  keys: ['yourSecretKey'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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
    res.redirect('/admin/dashboard');
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
        console.log("Cookie:", userDoc.data());
        console.log("Cookie:", req.session.user);
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
