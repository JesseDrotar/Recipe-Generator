const express = require('express');
const router = express.Router();

const recipe = require('./recipeModule');

router.get('/', (req, res, next) =>{
    res.redirect('/home');
})

router.get('/home', recipe.homePage);

//show all pantries in the database
router.get('/recipe', recipe.displayRecipes);

//add a new pantry to the database
router.get('/recipe/add', recipe.addRecipe);
router.post('/recipe/add', recipe.saveRecipe);

//edit a pantry in the database
router.get('/recipe/edit/:id', recipe.editRecipe);
router.post('/recipe/edit/:id', recipe.editRecipeSave);

//delete a pantry in the database
router.get('/recipe/delete/:id', recipe.deleteRecipe);

module.exports = router;