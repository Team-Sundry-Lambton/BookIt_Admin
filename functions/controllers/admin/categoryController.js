
const path = require('path');
const rootFolder = process.cwd();
const config = require(path.join(rootFolder, "/config/db"));;
const admin = require('firebase-admin');

// performing crud operations in the firebase firestore
// add
// get all
// get
// update
// delete
const categoriesCollection = admin.firestore().collection('categories');
async function getAllCategories() {
  try {
    const querySnapshot = await categoriesCollection.orderBy('item_order', 'asc').get();
    const categories = [];
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const parentId = data.parent_id;
      let parentData = null;
      if (parentId != "") {
        const parentDoc = await categoriesCollection.doc(parentId).get();
        parentData = parentDoc.data();
      }
      categories.push({
        id: doc.id,
        ...data,
        parent_cat: parentData,
      });
    }
    return categories;
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
    data.created_date = Math.floor(Date.now() / 1000);
    data.modified_date = Math.floor(Date.now() / 1000);
    console.log("data: ",data);
    const writeResult = await categoriesCollection.add({
      name: data.name,
      picture: data.picture,
      description: data.description,
      item_order: data.item_order,
      status: data.status,
      parent_id: data.parent_id,
      created_date: data.created_date,
      modified_date: data.modified_date
    })
    .then(function() {console.log("Document successfully written!");})
    .catch(function(error) {console.error("Error writing document: ", error);});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
/* 



const getCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log("Getting category= %s", id);
    const category = await fireStore.collection("categories").doc(id);
    const data = await category.get();
    if (!data.exists) {
      res.status(404).json({ message: "Record not found" });
    } else {
      res.status(200).json(data.data());
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log("Updating category= %s", id);
    const data = req.body;
    const category = await fireStore.collection("categories").doc(id);
    await category.update(data);
    res.status(204).json({ message: "Record updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log("Deleting category= %s", id);
    await fireStore.collection("categories").doc(id).delete();
    res.status(204).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; */

// todo - add delete all employees

module.exports = {
  addCategory,
  getAllCategories,
  // getCategory,
  // updateCategory,
  // deleteCategory
};
