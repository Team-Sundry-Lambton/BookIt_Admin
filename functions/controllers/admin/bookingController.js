
const path = require('path');
const rootFolder = process.cwd();
const config = require(path.join(rootFolder, "/config/db"));;
const admin = require('firebase-admin');
const moment = require('moment-timezone');

const dbCollection = admin.firestore().collection('booking');
const vendorCollection = admin.firestore().collection('vendor');
const clientCollection = admin.firestore().collection('client');
const serviceCollection = admin.firestore().collection('service');
const addressCollection = admin.firestore().collection('address');

async function getAllBookings(searchByVendor, searchByCategory, searchByStatus, limit, page) {
  try {
    const startAfter = page ? (page-1) * limit : null;
    let query = dbCollection.orderBy('date', 'desc');

    if (searchByStatus) {
      query = dbCollection.where('status', '==', searchByStatus);
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
      
      const timestamp = data.date;
      const date = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
      const timeZone = 'America/New_York';
      const convertedDate = moment(date).tz(timeZone).format('MMMM DD, YYYY [at] h:mm:ss A');
      data.date = convertedDate;

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
    const result = [];
    console.log("Getting bookingId= %s", id);
    const data = await dbCollection.doc(id).get();
    const booking = data.data();
    let vendor = null;
    let client = null;
    let service = null;
    let address = null;
    
    try {
      const queryServiceSnapshot = await serviceCollection.where('serviceId', '==', booking.parentService).get();
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
      const queryAddressSnapshot = await addressCollection.where('parentService', '==', service.serviceId).get();
      if (!queryAddressSnapshot.empty) {
        const addressDoc = queryAddressSnapshot.docs[0];
        address = addressDoc.data();
      } else {
        address = null;
      }
    } catch (error) {
      console.error(error);
      address = null;
    }

    try {
      const queryVendorSnapshot = await vendorCollection.where('email', '==', booking.vendorEmailAddress).get();
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
      const queryClientSnapshot = await clientCollection.where('email', '==', booking.clientEmailAddress).get();
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

    const timestamp = booking.date;
    const date = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
    const timeZone = 'America/New_York';
    const convertedDate = moment(date).tz(timeZone).format('MMMM DD, YYYY [at] h:mm:ss A');
    booking.date = convertedDate;

    result.push({
      booking: booking,
      vendor: vendor,
      client: client,
      service: service,
      address: address
    });

    if (!result.exists) {
      return result;
    } else {
      return null;
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const updateBooking = async (req, res, next) => {
  console.log('updating cat');
  try {
    const data = req.body;
    const id = data.id;
    console.log("Updating category= %s", id);
    const booking = await dbCollection.doc(id);
    const updateResult = booking.update({
      status: data.status
    })
      .then(function() {
        console.log("Document successfully updated!");
        res.redirect('/admin/booking/index');
      })
      .catch(function(error) {console.error("Error deleting document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateInvoiceBooking = async (bookingId, url) => {
  console.log('updating bookingId:', bookingId);
  try {
    const booking = await dbCollection.doc(bookingId);
    const updateResult = booking.update({
      invoiceURL: url
    })
      .then(function() {
        console.log("Document successfully updated!");
        res.redirect('/admin/booking/index');
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
  deleteBooking,
  updateInvoiceBooking
};
