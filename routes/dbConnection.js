const mongoose = require('mongoose');
const credentials = require('../credentials.js');

const dbUrl = 'mongodb://' + credentials.username +
':' + credentials.password + '@' + credentials.host + ':' + credentials.port + '/' + credentials.database;

let connection = null;
let ingredientModel = null;

const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const pantrySchema = new Schema({
    pantryName: String,
    pantryIngredients: [
        {ingredient: String, quantity: Number}
    ]
});

module.exports.getModel =
 () => {
     if(connection == null) {
        console.log('Creating Connection...');
        connection = mongoose.createConnection(dbUrl);
        pantryModel = connection.model('PantryModel', pantrySchema);
     };
     return pantryModel;
 };
