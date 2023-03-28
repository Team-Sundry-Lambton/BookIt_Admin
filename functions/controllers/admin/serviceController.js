
const path = require('path');
const rootFolder = process.cwd();
const config = require(path.join(rootFolder, "/config/db"));;
const admin = require('firebase-admin');

const dbCollection = admin.firestore().collection('service');
const mediaCollection = admin.firestore().collection('media');
const addressCollection = admin.firestore().collection('address');

async function getAllServices(searchByVendor, searchByCategory, limit, page) {
  try {
    const startAfter = page ? (page-1) * limit : null;
    let query = dbCollection.orderBy('serviceId', 'desc');

    if (searchByVendor && !searchByCategory) {
      query = dbCollection.where('parentVendor', '==', searchByVendor);
    } else if (!searchByVendor && searchByCategory) {
      query = dbCollection.where('parentCategory', '==', searchByCategory);
    } else if (searchByVendor && searchByCategory) {
      query = dbCollection.where('parentVendor', '==', searchByVendor).where('parentCategory', '==', searchByCategory);
    }

    const querySnapshot = await query.limit(limit).get();
    const results = [];

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const serviceId = data.serviceId;
      let medias = null;
      let location = null;

      try {
        const queryMediaSnapshot = await mediaCollection.where('parentService', '==', serviceId).get();
        if (!queryMediaSnapshot.empty) {
          const mediasDoc = queryMediaSnapshot.docs;
          medias = [];
          mediasDoc.forEach(doc => {
            medias.push(doc.data());
          });
        } else {
          medias = null;
        }

      } catch (error) {
        console.error(error);
        medias = null;
      }
      
      try {
        const queryLocationSnapshot = await addressCollection.where('parentService', '==', serviceId).get();
        if (!queryLocationSnapshot.empty) {
          const locationDoc = queryLocationSnapshot.docs[0];
          location = locationDoc.data();
        } else {
          location = null;
        }
      } catch (error) {
        console.error(error);
        location = null;
      }
      

      results.push({
        id: doc.id,
        ...data,
        medias: medias,
        location: location
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


const getService = async (id) => {
  try {
    console.log("Getting serviceId= %s", id);
    const data = await dbCollection.doc(id).get();
    const service = data.data();
    if (!service.exists) {
      return service;
    } else {
      return null;
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const updateService = async (req, res, next) => {
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

const addService = async (req, res, next) => {
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

const deleteService = async (req, res, next) => {
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


async function getMaxItemOrderOfCategories() {
  try {
    const querySnapshot = await categoriesCollection.orderBy('item_order', 'desc').limit(1).get();
    const maxOrderDoc = querySnapshot.docs[0];
    const maxItemOrder = maxOrderDoc.data().item_order;
    
    return maxItemOrder;
  } catch (err) {
    console.log('Error getting documents', err);
    throw err;
  }
}

module.exports = {
  addService,
  getAllServices,
  getService,
  updateService,
  deleteService,
  //getMaxItemOrderOfCategories
};
