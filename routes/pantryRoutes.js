const express = require('express');
const router = express.Router();

const pantry = require('./pantryModule');

//show all pantries in the database
router.get('/pantry', pantry.displayPantries);

//add a new pantry to the database
router.get('/pantry/add', pantry.addPantry);
router.post('/pantry/add', pantry.savePantry);

//edit a pantry in the database
router.get('/pantry/edit/:id', pantry.editPantry);
router.post('/pantry/edit/:id', pantry.editPantrySave);

//delete a pantry in the database
router.get('/pantry/delete/:id', pantry.deletePantry);

//display available recipes
router.get('/recipe/available/:id', pantry.availableRecipes);


module.exports = router;