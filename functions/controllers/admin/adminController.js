
const path = require('path');
const rootFolder = process.cwd();
const config = require(path.join(rootFolder, "/config/db"));;
const admin = require('firebase-admin');
const bcrypt = require("bcryptjs")

const dbCollection = admin.firestore().collection('admins');


async function getAllAdmins(limit, page) {
  try {
    const startAfter = page ? (page-1) * limit : null;
    let query = dbCollection.orderBy('firstname', 'asc');
    
    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    const querySnapshot = await query.limit(limit).get();
    const results = [];

    for (const doc of querySnapshot.docs) {
      const data = doc.data();

      results.push({
        id: doc.id,
        ...data
      });
    }

    const totalResult = await dbCollection.get();
    const totalCount = totalResult.docs.length;

    return {
        results,
        next: querySnapshot.docs.length === limit ? querySnapshot.docs[limit - 1].id : null,
        totalCount,
    };
  } catch (err) {
    console.log('Error getting documents', err);
    throw err;
  }
}

const deleteAdmin = async (req, res, next) => {
  try {
    const id = req.body.adminId;
    console.log("Deleting admin= %s", id);
    const deleteResult = dbCollection.doc(id).delete()
      .then(function() {
        console.log("Document successfully deleted!");
        res.redirect('/admin/admin/index');
      })
      .catch(function(error) {console.error("Error deleting document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



const getAdmin = async (id) => {
  try {
    console.log("Getting admin= %s", id);
    const data = await dbCollection.doc(id).get();
    const admin = data.data();
    if (!admin.exists) {
      return admin;
    } else {
      return null;
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAdmin = async (req, res, next) => {
  try {
    console.log("Updating admin= %s", id);
    const data = req.body;
    const id = data.id;
    data.status = data.status == "on" ? true : false;
    data.modified_date = Math.floor(Date.now() / 1000);
    const admin = await dbCollection.doc(id);
    const updateResult = admin.update({
      firstname: data.firstname,
      lastname: data.lastname,
      avatar: data.avatar,
      phone: data.phone,
      email: data.email,
      status: data.status,
      modified_date: data.modified_date
    })
      .then(function() {
        console.log("Document successfully updated!");
        res.redirect('/admin/admin/index');
      })
      .catch(function(error) {console.error("Error deleting document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const addAdmin = async (req, res, next) => {
  try {
    console.log("Adding new admin");
    const data = req.body;
    data.avatar = "https://media.istockphoto.com/id/465466108/photo/cn-tower-toronto-cityscape-on-lake-ontario.jpg?b=1&s=170667a&w=0&k=20&c=nFPW1Gi2uQfbkkVM5oOZwD9n_Qy3gtcIkdISh8e8PAA="
    data.status = data.status == "on" ? true : false;
    data.created_date = Math.floor(Date.now() / 1000);
    data.modified_date = Math.floor(Date.now() / 1000);
    hashedNewPassword = await bcrypt.hash(data.password, 8); 
    console.log(data);
    const writeResult = await dbCollection.add({
      firstname: data.firstname,
      lastname: data.lastname,
      avatar: data.avatar,
      phone: data.phone,
      password: hashedNewPassword,
      email: data.email,
      status: data.status,
      created_date: data.created_date,
      modified_date: data.modified_date
    })
    .then(function() {
      console.log("Document successfully written!");
      res.redirect('/admin/admin/index');
    })
    .catch(function(error) {console.error("Error writing document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};






module.exports = {
  addAdmin,
  getAllAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin
};
