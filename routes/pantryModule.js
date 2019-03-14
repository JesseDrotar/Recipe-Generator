//Pantry object that represents all ingredients possessed by the user

const DB = require('./dbConnection.js');
const Pantry = DB.getModel();

const RecDB = require('./recipeDBConnection');
const Recipe = RecDB.getModel();

//function to create a new pantry object in mongoDB
module.exports.addPantry = (req, res, next) => {
    res.render('addPantryView');
}

//function to edit a pantry object by ID in mongoDB
module.exports.editPantry = (req, res, next) => {

    let id = req.params.id;
    res.render('editPantryView', {data : {id: id}});
}

//function to delete a pantry object by ID in mongoDB
module.exports.deletePantry = (req, res, next) => {
    let id = req.params.id;
	    
	    Pantry.findById(id,  (err, pantry) => {
	      if(err)
	        console.log("Error Selecting : %s ", err); 
	      if (!pantry)
	        return res.render('404');
	      
	      pantry.remove( (err) => {
	        if (err)
	          console.log("Error deleting : %s ",err );
	        res.redirect('/pantry');
	      });        
	    });
};

//REST endpoint that finds all pantry objects in the DB and displays them in the requested format
module.exports.displayPantries = (req, res, next) => {
    Pantry.find({}, (err, pantries) => {
        if(err)
            console.log("Error : %s", err);
        
        let results = pantries.map( (pantry) => {
            return {
                id: pantry._id,
                pantryName: pantry.pantryName,
                pantryIngredients: pantry.pantryIngredients
            }
        });

        

        res.format({
            //JSON request handling
            'application/json': () => {
                res.json(results);
            },
            //XML request handling
            'application/xml': function() {
                let pantriesXML = 
                '<?xml version="1.0"?>\n<pantries>\n' +
                        results.map(function(e){
                            return ' <pantry name="' + e.pantryName + '">' + '\n' + '\t' +
                                '<pantryIngredients>' + e.pantryIngredients + '<pantry>' + '\n' + '\t' +
                            '</pantries>';
                        }).join('\n') + '\n</pantries>\n';
                res.type('application/xml');
                res.send(pantriesXML);
            },
            //HTML request handling, render employeeList view
            'text/html': function(){
                res.render('displayPantriesView', {data: results});
            }
        });
   })
};

//saves a new pantry object to the DB
module.exports.savePantry = (req, res, next) => {

    let pantryIngredients = req.body.ingredients.toLowerCase();

    if(pantryIngredients.length > 0) {
        pantryIngredients = pantryIngredients.split(',').map((elem) => {
            let ingredient = elem.trim().split(' ');
            return {ingredient: ingredient[0],
                    quantity: ingredient[1]};
            });
    } else
        pantryIngredients = [];
    
    let pantry = new Pantry({
        pantryName: req.body.pantryName,
        pantryIngredients: pantryIngredients
    })

    pantry.save((err) => {
        if(err)
            console.log("Error : %s", err);
        res.redirect('/pantry');
    })
};

//saves a pantry object that has been edited
module.exports.editPantrySave = (req, res, next) => {

    let id = req.params.id;

    Pantry.findById(id, (err, pantry) => {
        if(err)
            console.log("Error Selecting : %s", err);
        if(!pantry)
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

            let existingIngredients = pantry.pantryIngredients.map(function(ingredient) {return ingredient.ingredient;});

            for(let i =0; i<newIngredients.length; i++) {

                //will return -1 if the ingredient doesn't already exist in the list of pantry ingredients
                let index = existingIngredients.indexOf(newIngredients[i].ingredient);

                if(index === -1) {
                    pantry.pantryIngredients.push(newIngredients[i]);
                }
                else {
                    //increases the quantity of the existing ingredient
                    pantry.pantryIngredients[index].quantity += newIngredients[i].quantity;
                }
            }
        }

        pantry.save((err) => {
            if(err)
                console.log("Error updating : %s", err);
            res.redirect('/pantry');
        });
    });
};

//displays to the user the available recipes 
module.exports.availableRecipes = (req, res, next) => {
    let id = req.params.id;

    Recipe.find({}, (err, recipies) => {
        Pantry.findById(id, (err, pantry) => {

            //returns all ingredient names in a pantry
            selectedPantryIngredients = pantry.pantryIngredients.map((ingredient) => {
                return ingredient.ingredient;
            });

            matchedRecipies = [];
            
            //loops over every recipe ingredient to see if the ingredient exists in the pantry
            //and if the ingredient exists, that the quantity of the ingredient is >= to the 
            //quantity the ingredient calls for
            for(let i = 0; i <recipies.length; i++) {
                let flag = true;
                for(let j = 0; j < recipies[i].recipeIngredients.length; j++) {
                    
                    let ingredient = recipies[i].recipeIngredients[j].ingredient;
                    let quantity = recipies[i].recipeIngredients[j].quantity

                    let exists = selectedPantryIngredients.indexOf(ingredient);

                    if(exists === -1) {
                        flag = false;
                    }
                    else {
                        if(pantry.pantryIngredients[exists].quantity >= quantity) {
                            
                        }
                        else {
                            flag = false;
                        }
                    }

                    
                }

                if(flag === true) {
                    matchedRecipies.push(recipies[i]);
                }
            }

            //displays the appropriate view based on how many recipes matched
            if(matchedRecipies.length == 0) {
                res.render('noRecipesAvailable', {data: matchedRecipies});
            }
            else {
                res.render('availableRecipesView', {data: matchedRecipies});
            }
        })
    })
}