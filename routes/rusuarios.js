module.exports = function(app, swig, gestorBD) {

    app.post('/usuario', function(req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let confirmPass = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.confirmPassword).digest('hex');
        let usuario = {
            name : req.body.name,
            surname : req.body.surname,
            email : req.body.email,
            money : 100,
            password : seguro,
            role : 'Estandar'
        }
        validaDatosRegistro(usuario, confirmPass, function(errors){
            if (errors != null && errors.length > 0){
                res.status(403);
                res.json({
                    errores : errors
                })
            } else {
                gestorBD.insertarUsuario(usuario, function(id) {
                    if (id == null){
                        res.send("Error al insertar el usuario");
                    } else {
                        let respuesta = swig.renderFile("views/busuario.html");
                        res.send(respuesta);
                    }
                });
            }
        });
    });

    app.get("/registrarse", function(req, res) {
        let respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });

    app.get("/identificarse", function(req, res) {
        let respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });

    app.post("/identificarse", function(req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email : req.body.email,
            password : seguro
        }
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;

                req.session.errores = {mensaje:"Email o password incorrecto",tipoMensaje:"alert-danger"};

                res.redirect("/errors");



            } else {
                //req.session.usuario = usuarios[0].email;
                let respuesta = swig.renderFile("views/busuario.html");
                res.send(respuesta);
            }
        });
    });

    app.get("/errors", function(req, res) {
        let respuesta = swig.renderFile('views/error.html',
            {
                mensaje : req.session.errores.mensaje,
                tipoMensaje : req.session.errores.tipoMensaje
            });
        res.send(respuesta);
    });

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.send("Usuario desconectado");
    });

    function validaDatosRegistro(usuario,confirmPassword, funcionCallback){
        let errors = new Array();

        if (usuario.password != confirmPassword){
            errors.push("La contraña no coincide en ambos campos");
        }

        if (errors.length <= 0){
            funcionCallback(null);
        }else{
            funcionCallback(errors);
        }
    }

}