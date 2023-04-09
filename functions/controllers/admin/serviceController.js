
const path = require('path');
const rootFolder = process.cwd();
const config = require(path.join(rootFolder, "/config/db"));;
const admin = require('firebase-admin');

const dbCollection = admin.firestore().collection('service');
const mediaCollection = admin.firestore().collection('media');
const addressCollection = admin.firestore().collection('address');

async function getAllServices(searchByVendor, searchByCategory, searchByStatus, limit, page) {
  try {
    const startAfter = page ? (page-1) * limit : null;
    let query = dbCollection.orderBy('serviceId', 'asc');

    if (searchByVendor && !searchByCategory) {
      query = dbCollection.where('parentVendor', '==', searchByVendor);
    } else if (!searchByVendor && searchByCategory) {
      query = dbCollection.where('parentCategory', '==', searchByCategory);
    } else if (searchByVendor && searchByCategory) {
      query = dbCollection.where('parentVendor', '==', searchByVendor).where('parentCategory', '==', searchByCategory);
    }

    if (searchByStatus) {
      query = dbCollection.where('status', '==', searchByStatus);
      searchByVendor = "";
      searchByCategory = "";
    }
    
    if (startAfter) {
      query = query.startAfter(startAfter);
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
    const results = [];
    console.log("Getting serviceId= %s", id);
    const data = await dbCollection.doc(id).get();
    const service = data.data();
    if (!service.exists) {
      try {
        const queryMediaSnapshot = await mediaCollection.where('parentService', '==', service.serviceId).get();
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

      results.push({
        medias: medias,
        service: service
      });

      return results[0];
    } else {
      return null;
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteService = async (req, res, next) => {
  try {
    const id = req.body.categoryId;
    console.log("Deleting category= %s", id);
    const deleteResult = dbCollection.doc(id).delete()
      .then(function() {
        console.log("Document successfully deleted!");
        res.redirect('/admin/category/index');
      })
      .catch(function(error) {console.error("Error deleting document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const approveService = async (req, res, next) => {
  try {
    const id = req.body.serviceId;
    const data = req.body;
    console.log("Approve service id= %s", data);
    const service = await dbCollection.doc(id);
    const updateResult = service.update({
      status: data.status
    })
      .then(function() {
        console.log("Document successfully updated!");
        res.redirect('/admin/service/index');
      })
      .catch(function(error) {console.error("Error approving document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const updateService = async (req, res, next) => {
  
  try {
    const data = req.body;
    const id = data.id;
    console.log("Updating service= %s", id);
    data.equipment = data.equipment == "on" ? true : false;
    data.modified_date = Math.floor(Date.now() / 1000);
    const service = await dbCollection.doc(id);
    const updateResult = service.update({
      cancelPolicy: data.cancelPolicy,
      modified_date: data.modified_date,
      equipment: data.equipment,
      parentCategory: data.parentCategory,
      parentVendor: data.parentVendor,
      price: data.price,
      priceType: data.priceType,
      serviceDescription: data.serviceDescription,
      serviceTitle: data.serviceTitle,
      serviceId: data.serviceId,
      status: data.status
    })
      .then(function() {
        console.log("Document successfully updated!");
        res.redirect('/admin/service/index');
      })
      .catch(function(error) {console.error("Error deleting document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addService = async (req, res, next) => {
  try {
    console.log("Adding new service");
    const data = req.body;
    data.created_date = Math.floor(Date.now() / 1000);
    data.equipment = data.equipment == "on" ? true : false;
    var maxId = await getMaxServiceId();
    data.serviceId = maxId + 1;
    const writeResult = await dbCollection.add({
      cancelPolicy: data.cancelPolicy,
      created_date: data.created_date,
      equipment: data.equipment,
      parentCategory: data.parentCategory,
      parentVendor: data.parentVendor,
      price: data.price,
      priceType: data.priceType,
      serviceDescription: data.serviceDescription,
      serviceTitle: data.serviceTitle,
      serviceId: data.serviceId,
      status: data.status
    })
    .then(function() {
      console.log("Document successfully written!");
      res.redirect('/admin/service/index');
    })
    .catch(function(error) {console.error("Error writing document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

async function getMaxServiceId() {
  try {
    const querySnapshot = await dbCollection.orderBy('serviceId', 'desc').limit(1).get();
    const maxIdDoc = querySnapshot.docs[0];
    const maxId = maxIdDoc.data().serviceId;

    return maxId;
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
  approveService
};
