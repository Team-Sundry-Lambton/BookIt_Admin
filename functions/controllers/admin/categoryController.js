
const path = require('path');
const rootFolder = process.cwd();
const config = require(path.join(rootFolder, "/config/db"));;
const admin = require('firebase-admin');

const dbCollection = admin.firestore().collection('categories');

const express = require('express');
const multer = require('multer');



async function getListCategories() {
  try {
    const querySnapshot = await dbCollection.orderBy('name', 'asc').get();
    const results = [];
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      /* const parentId = data.parent_id;
      let parentData = null;
      if (parentId != "") {
        const parentDoc = await dbCollection.doc(parentId).get();
        parentData = parentDoc.data();
      } */
      results.push({
        id: doc.id,
        ...data,
        //parent_cat: parentData,
      });
    }
    return results;
  } catch (err) {
    console.log('Error getting documents', err);
    throw err;
  }
}
async function getAllCategories(limit, page) {
  try {
    const startAfter = page ? (page-1) * limit : null;
    let query = dbCollection.orderBy('name', 'asc');
    
    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    const querySnapshot = await query.limit(limit).get();
    const results = [];

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      /*
      const parentId = data.parent_id;
      let parentData = null;

      if (parentId != "") {
        const parentDoc = await dbCollection.doc(parentId).get();
        parentData = parentDoc.data();
      } */

      results.push({
        id: doc.id,
        ...data,
        //parent_cat: parentData,
      });
    }

    const totalResults = await dbCollection.get();
    const totalCount = totalResults.docs.length;
    const next = querySnapshot.docs.length === limit ? querySnapshot.docs[limit - 1].id : null;

    return {
      results,
      next: next,
      totalCount
    };
  } catch (err) {
    console.log('Error getting documents', err);
    throw err;
  }
}



const addCategory = async (req, res, next) => {
  try {
    console.log("Adding new Category");
    const data = req.body;
    console.log(data);
    multi_upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading.
          res.status(500).send({ error: { message: `Multer uploading error: ${err.message}` } }).end();
          return;
      } else if (err) {
          // An unknown error occurred when uploading.
          if (err.name == 'ExtensionError') {
              res.status(413).send({ error: { message: err.message } }).end();
          } else {
              res.status(500).send({ error: { message: `unknown uploading error: ${err.message}` } }).end();
          }
          return;
      }

      // Everything went fine.
      // show file `req.files`
      // show body `req.body`
      
      res.status(200).end('Your files uploaded.');
  })

    /* data.picture = "https://media.istockphoto.com/id/465466108/photo/cn-tower-toronto-cityscape-on-lake-ontario.jpg?b=1&s=170667a&w=0&k=20&c=nFPW1Gi2uQfbkkVM5oOZwD9n_Qy3gtcIkdISh8e8PAA="
    data.status = data.status == "on" ? true : false;
    data.created_date = Math.floor(Date.now() / 1000);
    data.modified_date = Math.floor(Date.now() / 1000);
    const writeResult = await dbCollection.add({
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
    .catch(function(error) {console.error("Error writing document: ", error);}); */
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCategory = async (req, res, next) => {
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

const getCategory = async (id) => {
  try {
    console.log("Getting category= %s", id);
    const data = await dbCollection.doc(id).get();
    const category = data.data();
    if (!category.exists) {
      return category;
    } else {
      return null;
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const updateCategory = async (req, res, next) => {
  console.log('updating cat');
  //const id = req.params.id;
  //const data = req.body;
  
  try {
    const data = req.body;
    const id = data.id;
    //data.picture = "https://media.istockphoto.com/id/465466108/photo/cn-tower-toronto-cityscape-on-lake-ontario.jpg?b=1&s=170667a&w=0&k=20&c=nFPW1Gi2uQfbkkVM5oOZwD9n_Qy3gtcIkdISh8e8PAA="
    //data.picture = "https://media.istockphoto.com/id/465466108/photo/cn-tower-toronto-cityscape-on-lake-ontario.jpg?b=1&s=170667a&w=0&k=20&c=nFPW1Gi2uQfbkkVM5oOZwD9n_Qy3gtcIkdISh8e8PAA="
    //https://firebasestorage.googleapis.com/v0/b/fir-dd2bd.appspot.com/o/bookMe%2FCategory%2Faccounting.png?alt=media&token=27055157-7bf8-41cf-9cb1-112f78e18cba
    data.status = data.status == "on" ? true : false;
    data.modified_date = Math.floor(Date.now() / 1000);
    if(data.item_order == ""){
      var maxItemOrder = await getMaxItemOrderOfCategories();
      data.item_order = maxItemOrder + 1;
    }
    data.item_order = parseInt(data.item_order);
    console.log("Updating category= %s", id);
    console.log(data);
    const category = await dbCollection.doc(id);
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

async function getMaxItemOrderOfCategories() {
  try {
    const querySnapshot = await dbCollection.orderBy('item_order', 'desc').limit(1).get();
    const maxOrderDoc = querySnapshot.docs[0];
    const maxItemOrder = maxOrderDoc.data().item_order;
    
    return maxItemOrder;
  } catch (err) {
    console.log('Error getting documents', err);
    throw err;
  }
}

module.exports = {
  addCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getListCategories,
  getMaxItemOrderOfCategories
};
