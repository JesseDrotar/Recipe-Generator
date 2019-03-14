//Pantry object that represents all ingredients possessed by the user

const DB = require('./recipeDBConnection');
const Recipe = DB.getModel();

//render the homepage
module.exports.homePage = (req, res, next) => {
    res.render('homeView');
}

//displays the view to add a new recipe to the system
module.exports.addRecipe = (req, res, next) => {
    res.render('addRecipeView');
}

//displays the form to edit a recipe
module.exports.editRecipe = (req, res, next) => {

    let id = req.params.id;
    res.render('editRecipeView', {data : {id: id}});
}

//deletes a recipe from the DB
module.exports.deleteRecipe = (req, res, next) => {
    let id = req.params.id;
	    
	    Recipe.findById(id,  (err, recipe) => {
	      if(err)
	        console.log("Error Selecting : %s ", err); 
	      if (!recipe)
	        return res.render('404');
	      
	      recipe.remove( (err) => {
	        if (err)
	          console.log("Error deleting : %s ",err );
	        res.redirect('/recipe');
	      });        
	    });
};

//displays all of the recipes in the database in the requested format
module.exports.displayRecipes = (req, res, next) => {
    Recipe.find({}, (err, recipies) => {
        if(err)
            console.log("Error : %s", err);
        
        let results = recipies.map( (recipe) => {
            return {
                id: recipe._id,
                recipeName: recipe.recipeName,
                recipeIngredients: recipe.recipeIngredients
            }
        });

        res.format({
            //JSON request handling
            'application/json': () => {
                res.json(results);
            },
            //XML request handling
            'application/xml': function() {
                let recipesXML = 
                '<?xml version="1.0"?>\n<recipes>\n' +
                        results.map(function(e){
                            return ' <recipe name="' + e.recipeName + '">' + '\n' + '\t' +
                                '<recipeIngredients>' + e.recipeIngredients + '<recipe>' + '\n' + '\t' +
                            '</recipes>';
                        }).join('\n') + '\n</recipes>\n';
                res.type('application/xml');
                res.send(recipesXML);
            },
            //HTML request handling, render employeeList view
            'text/html': function(){
                res.render('displayRecipesView', {data: results});
            }
        });        
    })
};

//saves a recipe to the DB after creating a new recipe object
module.exports.saveRecipe = (req, res, next) => {

    let recipeIngredients = req.body.ingredients.toLowerCase();

    if(recipeIngredients.length > 0) {
        recipeIngredients = recipeIngredients.split(',').map((elem) => {
            let ingredient = elem.trim().split(' ');
            return {ingredient: ingredient[0],
                    quantity: ingredient[1]};
            });
    } else
        recipeIngredients = [];
    
    let recipe = new Recipe({
        recipeName: req.body.recipeName,
        recipeIngredients: recipeIngredients
    })

    recipe.save((err) => {
        if(err)
            console.log("Error : %s", err);
        res.redirect('/recipe');
    })
};

//saves the updated recipe object to the DB
module.exports.editRecipeSave = (req, res, next) => {

    let id = req.params.id;

    Recipe.findById(id, (err, recipe) => {
        if(err)
            console.log("Error Selecting : %s", err);
        if(!recipe)
            return res.render('404');

        let newIngredients = req.body.ingredients.toLowerCase();
        if(newIngredients.length > 0) {
            newIngredients = 
                newIngredients.split(',').map((elem) => {
                    let newIngredient = elem.trim().split(' ');
                    return {ingredient: newIngredient[0],
                            quantity: Number(newIngredient[1])
                    }
                });
            let existingIngredients = recipe.recipeIngredients.map(function(ingredient) {return ingredient.ingredient;});

            for(let i =0; i<newIngredients.length; i++) {

                //will return -1 if the ingredient doesn't already exist in the list of pantry ingredients
                let index = existingIngredients.indexOf(newIngredients[i].ingredient);

                if(index === -1) {
                    recipe.recipeIngredients.push(newIngredients[i]);
                }
                else {
                    //increases the quantity of an existing ingredient
                    recipe.recipeIngredients[index].quantity += newIngredients[i].quantity;
                }
            }

        }

        recipe.save((err) => {
            if(err)
                console.log("Error updating : %s", err);
            res.redirect('/recipe');
        });
    });
};