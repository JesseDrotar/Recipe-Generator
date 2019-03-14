const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');

const app = express();

//set view engine
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//set up static resources
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var pantryRoutes = require('./routes/pantryRoutes');
app.use('/', pantryRoutes);

var recipeRoutes = require('./routes/recipeRoutes');
app.use('/', recipeRoutes);

app.use((req,res) => {
    res.status(404);
    res.render('404');
});

app.listen(3000, () => {
    console.log('http://localhost:3000');
});