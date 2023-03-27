
const path = require('path');
const rootFolder = process.cwd();
const config = require(path.join(rootFolder, "/config/db"));;
const admin = require('firebase-admin');

const dbCollection = admin.firestore().collection('booking');
const vendorCollection = admin.firestore().collection('vendor');
const clientCollection = admin.firestore().collection('client');
const serviceCollection = admin.firestore().collection('service');

async function getAllBookings(searchByVendor, searchByCategory, limit, page) {
  try {
    const startAfter = page ? (page-1) * limit : null;
    let query = dbCollection.orderBy('date', 'asc');

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
      let vendor = null;
      let client = null;
      let service = null;

      try {
        const queryServiceSnapshot = await serviceCollection.where('serviceId', '==', data.parentService).get();
        if (!queryServiceSnapshot.empty) {
          const serviceDoc = queryServiceSnapshot.docs[0];
          service = serviceDoc.data();
        } else {
          service = null;
        }
      } catch (error) {
        console.error(error);
        service = null;
      }

      try {
        const queryVendorSnapshot = await vendorCollection.where('email', '==', data.vendorEmailAddress).get();
        if (!queryVendorSnapshot.empty) {
          const vendorDoc = queryVendorSnapshot.docs[0];
          vendor = vendorDoc.data();
        } else {
          vendor = null;
        }
      } catch (error) {
        console.error(error);
        vendor = null;
      }

      try {
        const queryClientSnapshot = await clientCollection.where('email', '==', data.clientEmailAddress).get();
        if (!queryClientSnapshot.empty) {
          const clientDoc = queryClientSnapshot.docs[0];
          client = clientDoc.data();
        } else {
          client = null;
        }
      } catch (error) {
        console.error(error);
        client = null;
      }
      

      //const bookingDate = new Date(data.date);
      //data.date = `${bookingDate.getFullYear()}-${(bookingDate.getMonth() + 1).toString().padStart(2, '0')}-${bookingDate.getDate().toString().padStart(2, '0')}`;

      const timestamp = data.date;
      const milliseconds = timestamp / 1000; 
      const date = new Date(milliseconds); 
      data.date = date.toISOString(); 

      results.push({
        id: doc.id,
        ...data,
        vendor: vendor,
        client: client,
        service: service
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


const getBooking = async (id) => {
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


const updateBooking = async (req, res, next) => {
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

const deleteBooking = async (req, res, next) => {
  try {
    const id = req.body.adminId;
    console.log("Deleting category= %s", id);
    const deleteResult = dbCollection.doc(id).delete()
      .then(function() {
        console.log("Document successfully deleted!");
        res.redirect('/admin/booking/index');
      })
      .catch(function(error) {console.error("Error deleting document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


module.exports = {
  getAllBookings,
  getBooking,
  updateBooking,
  deleteBooking
};
