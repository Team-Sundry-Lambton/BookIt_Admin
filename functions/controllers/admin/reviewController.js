
const path = require('path');
const rootFolder = process.cwd();
const config = require(path.join(rootFolder, "/config/db"));;
const admin = require('firebase-admin');
const moment = require('moment-timezone');
const dbCollection = admin.firestore().collection('vendorReview');
const vendorCollection = admin.firestore().collection('vendor');
const clientCollection = admin.firestore().collection('client');
const serviceCollection = admin.firestore().collection('service');

async function getAllReviews(searchByVendor, searchByClient, limit, page) {
  try {
    const startAfter = page ? (page-1) * limit : null;
    let query = dbCollection.orderBy('date', 'desc');

    if (searchByVendor && !searchByClient) {
      query = dbCollection.where('parentVendor', '==', searchByVendor);
    } else if (!searchByVendor && searchByClient) {
      query = dbCollection.where('parentCategory', '==', searchByClient);
    } else if (searchByVendor && searchByClient) {
      query = dbCollection.where('parentVendor', '==', searchByVendor).where('parentCategory', '==', searchByClient);
    }

    const querySnapshot = await query.limit(limit).get();
    const results = [];

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      let service = null;
      let vendor = null;
      let client = null;

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
        client = null;
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
        service: service,
        vendor: vendor,
        client: client
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



module.exports = {
    getAllReviews
};
