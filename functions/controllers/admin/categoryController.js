
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
    data.picture = "https://media.istockphoto.com/id/465466108/photo/cn-tower-toronto-cityscape-on-lake-ontario.jpg?b=1&s=170667a&w=0&k=20&c=nFPW1Gi2uQfbkkVM5oOZwD9n_Qy3gtcIkdISh8e8PAA="
    data.status = data.status == "on" ? true : false;
    const writeResult = await dbCollection.add({
      name: data.name,
      picture: data.picture,
      description: data.description,
      status: data.status
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
  try {
    const data = req.body;
    console.log(data);
    const id = data.id;
    console.log("Updating category= %s", id);
    data.picture = "https://media.istockphoto.com/id/465466108/photo/cn-tower-toronto-cityscape-on-lake-ontario.jpg?b=1&s=170667a&w=0&k=20&c=nFPW1Gi2uQfbkkVM5oOZwD9n_Qy3gtcIkdISh8e8PAA="
    data.status = data.status == "on" ? true : false;
    const category = await dbCollection.doc(id);
    const updateResult = category.update({
      name: data.name,
      description: data.description,
      picture: data.picture,
      status: data.status
    })
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
  addCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getListCategories
};
