const mongoose = require('mongoose');
const credentials = require('../credentials.js');

const dbUrl = 'mongodb://' + credentials.username +
':' + credentials.password + '@' + credentials.host + ':' + credentials.port + '/' + credentials.database;

let connection = null;
let recipeModel = null;

const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const recipeSchema = new Schema({
    recipeName: String,
    recipeIngredients: [
        {ingredient: String, quantity: Number}
    ]
});

module.exports.getModel =
 () => {
     if(connection == null) {
        console.log('Creating Connection...');
        connection = mongoose.createConnection(dbUrl);
        recipeModel = connection.model('RecipeModel', recipeSchema);
     };
     return recipeModel;
 };
