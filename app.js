let express = require('express')
let app = express();

let jwt = require('jsonwebtoken');
app.set('jwt',jwt);

let rest = require('request');
app.set('rest', rest);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    // Debemos especificar todas las headers que se aceptan. Content-Type , token
    next();
});

let expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));



let crypto = require('crypto');

let mongo = require('mongodb');

let swig = require('swig');

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app, mongo);

// routerUsuarioToken
let routerUsuarioToken = express.Router();
routerUsuarioToken.use(function(req, res, next) {
    // obtener el token, vía headers (opcionalmente GET y/o POST).
    let token = req.headers['token'] || req.body.token || req.query.token;
    if (token != null) {
        // verificar el token
        jwt.verify(token, 'secreto', function(err, infoToken) {
            if (err || (Date.now()/1000 - infoToken.tiempo) > 240 ){
                res.status(403); // Forbidden
                res.json({
                    acceso : false,
                    error: 'Token invalido o caducado'
                });
                // También podríamos comprobar que intoToken.usuario existe
                return;

            } else {
                // dejamos correr la petición
                res.usuario = infoToken.usuario;
                next();
            }
        });

    } else {
        res.status(403); // Forbidden
        res.json({
            acceso : false,
            mensaje: 'No hay Token'
        });
    }
});
// Aplicar routerUsuarioToken
app.use('/api/oferta/lista', routerUsuarioToken);
app.use('/api/oferta/chat/*', routerUsuarioToken);

// routerUsuarioSession
let routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
    console.log("routerUsuarioSession");
    console.log(req.session.usuario);
    if ( req.session.usuario ) {
        if (req.session.role == 'Estandar'){
            next();
        }else{
            req.session.errores.mensaje = "El usuario identificado no es un usuario Estandar";
            req.session.errores.tipoMensaje = "alert-message";
            console.log("va a : "+req.session.destino)
            res.redirect("/errors" ,{
                mensaje : req.session.errores.mensaje,
                tipoMensaje : req.session.errores.tipoMensaje
            });
        }
    } else {
        console.log("va a : "+req.session.destino)
        res.redirect("/identificarse");
    }
});

//Aplicar routerUsuarioSession
app.use("/oferta/*",routerUsuarioSession);
app.use("/compra/*",routerUsuarioSession);

var routerUsuarioSessionAdmin = express.Router();
routerUsuarioSessionAdmin.use(function(req, res, next) {
    console.log("routerUsuarioSessionAdmin");

    if ( req.session.usuario ) {
        if (req.session.role == 'Admin'){
            next();
        }else{
            req.session.errores.mensaje = "El usuario identificado no es un usuario Admin";
            req.session.errores.tipoMensaje = "alert-message";
            console.log("va a : "+req.session.destino)
            res.redirect("/errors");
        }
    } else {
        console.log("va a : "+req.session.destino)
        res.redirect("/identificarse");
    }
});

//Aplicar routerUsuarioSessionAdmin
app.use("/usuario/*",routerUsuarioSessionAdmin);

app.use(express.static('public'));

app.set('port', 8081);
app.set('db', 'mongodb://admin:sdi@mywallapop-shard-00-00.agi7x.mongodb.net:27017,mywallapop-shard-00-01.agi7x.' +
    'mongodb.net:27017,mywallapop-shard-00-02.agi7x.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-c95pk5-' +
    'shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('clave','abcdefg');
app.set('crypto',crypto);

require("./routes/rusuarios.js")(app, swig, gestorBD); // (app, param1, param2, etc.)
require("./routes/rofertas.js")(app, swig, gestorBD); // (app, param1, param2, etc.)
require("./routes/rcompras.js")(app, swig, gestorBD); // (app, param1, param2, etc.)
require("./routes/rapiusuarios.js")(app, gestorBD);



app.get('/', function (req, res) {
    res.redirect('/');
})

app.listen(8081, function (){
    console.log('Servidor activo');
});