let express = require('express')
let app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    // Debemos especificar todas las headers que se aceptan. Content-Type , token
    next();
});

let crypto = require('crypto');

let mongo = require('mongodb');

let swig = require('swig');

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app, mongo);

app.use(express.static('public'));

app.set('port', 8081);
app.set('db', 'mongodb://admin:sdi@mywallapop-shard-00-00.agi7x.mongodb.net:27017,mywallapop-shard-00-01.agi7x.' +
    'mongodb.net:27017,mywallapop-shard-00-02.agi7x.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-c95pk5-' +
    'shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('clave','abcdefg');
app.set('crypto',crypto);

require("./routes/rusuarios.js")(app, swig, gestorBD); // (app, param1, param2, etc.)

app.listen(8081, function (){
    console.log('Servidor activo');
});