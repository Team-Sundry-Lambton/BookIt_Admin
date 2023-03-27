
const path = require('path');
const rootFolder = process.cwd();
const config = require(path.join(rootFolder, "/config/db"));;
const admin = require('firebase-admin');

const dbCollection = admin.firestore().collection('vendor');
const accountCollection = admin.firestore().collection('account');


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


const addVendor = async (req, res, next) => {
  try {
    console.log("Adding new Category");
    const data = req.body;
    data.picture = "https://media.istockphoto.com/id/465466108/photo/cn-tower-toronto-cityscape-on-lake-ontario.jpg?b=1&s=170667a&w=0&k=20&c=nFPW1Gi2uQfbkkVM5oOZwD9n_Qy3gtcIkdISh8e8PAA="
    data.status = data.status == "on" ? true : false;
    data.created_date = Math.floor(Date.now() / 1000);
    data.modified_date = Math.floor(Date.now() / 1000);
    const writeResult = await categoriesCollection.add({
      name: data.name,
      picture: data.picture,
      description: data.description,
      item_order: parseInt(data.item_order),
      status: data.status,
      parent_id: data.parent_id,
      created_date: data.created_date,
      modified_date: data.modified_date
    })
    .then(function() {
      console.log("Document successfully written!");
      res.redirect('/admin/category/index');
    })
    .catch(function(error) {console.error("Error writing document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteVendor = async (req, res, next) => {
  try {
    const id = req.body.categoryId;
    console.log("Deleting category= %s", id);
    const deleteResult = categoriesCollection.doc(id).delete()
      .then(function() {
        console.log("Document successfully deleted!");
        res.redirect('/admin/category/index');
      })
      .catch(function(error) {console.error("Error deleting document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};




const updateVendor = async (req, res, next) => {
  console.log('updating cat');
  const id = req.params.id;
  const data = req.body;
  data.picture = "https://media.istockphoto.com/id/465466108/photo/cn-tower-toronto-cityscape-on-lake-ontario.jpg?b=1&s=170667a&w=0&k=20&c=nFPW1Gi2uQfbkkVM5oOZwD9n_Qy3gtcIkdISh8e8PAA="
  data.status = data.status == "on" ? true : false;
  data.modified_date = Math.floor(Date.now() / 1000);
  if(data.item_order == ""){
    var maxItemOrder = await getMaxItemOrderOfCategories();
    data.item_order = maxItemOrder + 1;
  }
  data.item_order = parseInt(data.item_order);
  try {
    const data = req.body;
    const id = data.id;
    console.log("Updating category= %s", id);
    const category = await categoriesCollection.doc(id);
    const updateResult = category.update(data)
      .then(function() {
        console.log("Document successfully updated!");
        res.redirect('/admin/category/index');
      })
      .catch(function(error) {console.error("Error deleting document: ", error);});
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
