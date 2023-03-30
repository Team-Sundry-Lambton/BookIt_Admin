const admin = require('firebase-admin');

var serviceAccount = require("./fir-dd2bd-firebase-adminsdk-2f38c-1a4cb24a32.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fir-dd2bd-default-rtdb.firebaseio.com",
    storageBucket: "fir-dd2bd.appspot.com"
});
