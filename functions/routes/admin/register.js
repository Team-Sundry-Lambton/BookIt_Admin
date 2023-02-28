const express = require('express')
let app = express.Router()
const admin = require('firebase-admin');
const bcrypt = require("bcryptjs")

// Reference to Firestore collection containing admin user data
const adminsCollection = admin.firestore().collection('admins');

app.get('/', function (req, res) {
  res.render("register")
});

async function registerData(req){
    const { firstname, lastname, email, password, password_confirm } = req.body;
    let hashedPassword = await bcrypt.hash(password, 8);
  
    const writeResult = await adminsCollection.add({
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: hashedPassword
    })
    .then(function() {console.log("Document successfully written!");})
    .catch(function(error) {console.error("Error writing document: ", error);});
  }
  
app.post('/register',async (req,res) =>{
    var insert = await registerData(req);
    res.redirect('/login');
  });
module.exports = app
