
const path = require('path');
const rootFolder = process.cwd();
const config = require(path.join(rootFolder, "/config/db"));;
const admin = require('firebase-admin');

const dbCollection = admin.firestore().collection('client');
const reviewCollection = admin.firestore().collection('vendorReview');


async function getListClients() {
  try {
    const querySnapshot = await dbCollection.orderBy('firstName', 'asc').get();
    const results = [];
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      let parentData = null;
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
async function getAllClients(limit, page) {
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

      try {
        const queryReviewSnapshot = await reviewCollection
                                          .where('clientEmailAddress', '==', data.email)
                                          .where('vendorRating', '==', false)
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

const getClient = async (id) => {
  try {
    console.log("Getting client= %s", id);
    const data = await dbCollection.doc(id).get();
    const client = data.data();
    if (!client.exists) {
      return client;
    } else {
      return null;
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const deleteClient = async (req, res, next) => {
  try {
    const id = req.body.clientId;
    console.log("Deleting client= %s", id);
    const deleteResult = dbCollection.doc(id).delete()
      .then(function() {
        console.log("Document successfully deleted!");
        res.redirect('/admin/client/index');
      })
      .catch(function(error) {console.error("Error deleting document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const updateClient = async (req, res, next) => {
  try {
    const data = req.body;
    const id = data.id;
    console.log("Updating client= %s", id);
    data.picture = "https://media.istockphoto.com/id/465466108/photo/cn-tower-toronto-cityscape-on-lake-ontario.jpg?b=1&s=170667a&w=0&k=20&c=nFPW1Gi2uQfbkkVM5oOZwD9n_Qy3gtcIkdISh8e8PAA="
    data.status = data.status == "on" ? true : false;
    data.isPremium = data.isPremium == "on" ? true : false;
    const client = await dbCollection.doc(id);
    const updateResult = client.update({
      contactNumber: data.contactNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      isPremium: data.isPremium,
      picture: data.picture,
      status: data.status
    })
      .then(function() {
        console.log("Document successfully updated!");
        res.redirect('/admin/client/index');
      })
      .catch(function(error) {console.error("Error deleting document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addClient = async (req, res, next) => {
  try {
    console.log("Adding new client");
    const data = req.body;
    data.picture = "https://media.istockphoto.com/id/465466108/photo/cn-tower-toronto-cityscape-on-lake-ontario.jpg?b=1&s=170667a&w=0&k=20&c=nFPW1Gi2uQfbkkVM5oOZwD9n_Qy3gtcIkdISh8e8PAA="
    data.status = data.status == "on" ? true : false;
    data.isPremium = data.isPremium == "on" ? true : false;
    data.created_date = Math.floor(Date.now() / 1000);
    const writeResult = await dbCollection.add({
      contactNumber: data.contactNumber,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      isPremium: data.isPremium,
      picture: data.picture,
      status: data.status,
      created_date: data.created_date
    })
    .then(function() {
      console.log("Document successfully written!");
      res.redirect('/admin/client/index');
    })
    .catch(function(error) {console.error("Error writing document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  addClient,
  getAllClients,
  getClient,
  updateClient,
  deleteClient,
  getListClients
};
