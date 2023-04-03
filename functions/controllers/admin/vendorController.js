
const path = require('path');
const rootFolder = process.cwd();
const config = require(path.join(rootFolder, "/config/db"));;
const admin = require('firebase-admin');
const { database } = require('firebase-functions/v1/firestore');

const dbCollection = admin.firestore().collection('vendor');
const accountCollection = admin.firestore().collection('account');
const reviewCollection = admin.firestore().collection('vendorReview');


async function getListVendors() {
  try {
    const querySnapshot = await dbCollection.orderBy('firstName', 'asc').get();
    const results = [];
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      results.push({
        id: doc.id,
        ...data,
      });
    }
    return results;
  } catch (err) {
    console.log('Error getting documents', err);
    throw err;
  }
}
async function getAllVendors(limit, page) {
  try {
    const startAfter = page ? (page-1) * limit : null;
    let query = dbCollection.orderBy('firstName', 'asc');
    
    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    const querySnapshot = await query.limit(limit).get();
    const results = [];

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      let account = null;

      try {
        const queryAccountSnapshot = await accountCollection.where('vendorEmailAddress', '==', data.email).get();
        if (!queryAccountSnapshot.empty) {
          const accountDoc = queryAccountSnapshot.docs[0];
          account = accountDoc.data();
        } else {
          account = null;
        }
      } catch (error) {
        console.error(error);
        account = null;
      }
      
      try {
        const queryReviewSnapshot = await reviewCollection
                                          .where('vendorEmailAddress', '==', data.email)
                                          .where('vendorRating', '==', true)
                                          .get();
        if (!queryReviewSnapshot.empty) {
          var totalRating = 0;
          var totalReview = queryReviewSnapshot.docs.length;
          for (const doc of queryReviewSnapshot.docs) {
            const datas = doc.data();
            totalRating += datas.rating
          }
          data.rating = totalRating/totalReview;
        } else {
          data.rating = 0;
        }
      } catch (error) {
        console.error(error);
        data.rating = 0;
      }

      results.push({
        id: doc.id,
        ...data,
        account: account,
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

const deleteVendor = async (req, res, next) => {
  try {
    const id = req.body.vendorId;
    console.log("Deleting vendor= %s", id);
    const deleteResult = dbCollection.doc(id).delete()
      .then(function() {
        console.log("Document successfully deleted!");
        res.redirect('/admin/vendor/index');
      })
      .catch(function(error) {console.error("Error deleting document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const getVendor = async (id) => {
  try {
    console.log("Getting vendor= %s", id);
    const data = await dbCollection.doc(id).get();
    const vendor = data.data();

    let account = null;
    try {
      const queryAccountSnapshot = await accountCollection.where('vendorEmailAddress', '==', vendor.email).get();
      if (!queryAccountSnapshot.empty) {
        const accountDoc = queryAccountSnapshot.docs[0];
        account = accountDoc.data();
        account.id = accountDoc.id;
      } else {
        account = null;
      }
    } catch (error) {
      console.error(error);
      account = null;
    }

    
    if (!vendor.exists) {
      return {
        vendor,
        account
      };
    } else {
      return null;
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

async function getMaxId() {
  try {
    const querySnapshot = await dbCollection.orderBy('vendorId', 'desc').limit(1).get();
    const maxIdDoc = querySnapshot.docs[0];
    const maxId = maxIdDoc.data().vendorId;
    return maxId;
  } catch (err) {
    console.log('Error getting documents', err);
    throw err;
  }
}

const addVendor = async (req, res, next) => {
  try {
    console.log("Adding new vendor");
    const data = req.body;
    data.picture = "https://media.istockphoto.com/id/465466108/photo/cn-tower-toronto-cityscape-on-lake-ontario.jpg?b=1&s=170667a&w=0&k=20&c=nFPW1Gi2uQfbkkVM5oOZwD9n_Qy3gtcIkdISh8e8PAA="
    data.status = data.status == "on" ? true : false;
    data.created_date = Math.floor(Date.now() / 1000);
    var maxId = await getMaxId();
    const vendorId = maxId + 1;
    const writeResult = await dbCollection.add({
      vendorId: vendorId,
      contactNumber: data.contactNumber,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      picture: data.picture,
      status: data.status,
      created_date: data.created_date
    })
    .then(function() {
      accountCollection.add({
        accountNumber: data.accountNumber,
        institutionNumber: data.institutionNumber,
        recipiantBankName: data.recipiantBankName,
        recipiantName: data.recipiantName,
        transitNumber: data.transitNumber,
        vendorEmailAddress: data.email
      })
      console.log("Document successfully written!");
      res.redirect('/admin/vendor/index');
    })
    .catch(function(error) {console.error("Error writing document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const updateVendor = async (req, res, next) => {
  try {
    const data = req.body;
    const id = data.id;
    console.log("Updating category= %s", id);
    data.picture = "https://media.istockphoto.com/id/465466108/photo/cn-tower-toronto-cityscape-on-lake-ontario.jpg?b=1&s=170667a&w=0&k=20&c=nFPW1Gi2uQfbkkVM5oOZwD9n_Qy3gtcIkdISh8e8PAA="
    data.status = data.status == "on" ? true : false;
    data.modified_date = Math.floor(Date.now() / 1000);
    const vendor = await dbCollection.doc(id);
    bankAccountDoc = accountCollection.doc(data.bankAccountId);
        const updateResult = bankAccountDoc.update({
          accountNumber: data.accountNumber,
          institutionNumber: data.institutionNumber,
          recipiantBankName: data.recipiantBankName,
          recipiantName: data.recipiantName,
          transitNumber: data.transitNumber
        })
        .then(function() {
          updateResult = vendor.update({
            contactNumber: data.contactNumber,
            firstName: data.firstName,
            lastName: data.lastName,
            picture: data.picture,
            status: data.status
          })
            .then(function() {
              console.log("Document successfully updated!");
              res.redirect('/admin/vendor/index');
            })
            .catch(function(error) {console.error("Error updating document: ", error);});
        })
        .catch(function(error) {console.error("Error updating document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  addVendor,
  getAllVendors,
  getVendor,
  updateVendor,
  deleteVendor,
  getListVendors
};
