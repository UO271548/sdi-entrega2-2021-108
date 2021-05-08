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
                //let respuesta = swig.renderFile('views/bregistro.html',{
                  //  errores : errors
                //});
                //res.send(respuesta);

                req.session.erroresRegistro = errors;
                res.redirect("/registrarse");
            } else {
                gestorBD.insertarUsuario(usuario, function(id) {
                    if (id == null){
                        res.send("Error al insertar el usuario");
                    } else {
                        req.session.usuario = usuario.email;
                        req.session.role = usuario.role;
                        req.session.money = usuario.money;

                        let respuesta = swig.renderFile("views/busuario.html", {
                            usuario : req.session.usuario,
                            role : req.session.role,
                            money : req.session.money
                        });
                        res.send(respuesta);
                    }
                });
            }
        });
    });

    app.get('/usuario/lista', function (req, res){
        console.log(req.session.usuario);
        let criterio = {"role" : "Estandar"};
        gestorBD.obtenerUsuarios(criterio, function (usuarios){
            if (usuarios == null){
                req.session.errores = {mensaje:"Error al cargar la lista de usuarios.",tipoMensaje:"alert-danger"};

                res.redirect("/errors");
            }else{
                let respuesta = swig.renderFile('views/blistaUsuarios.html',
                    {
                        usuarios : usuarios,
                        usuario : req.session.usuario,
                        role : req.session.role,
                        money : req.session.money
                    });
                res.send(respuesta);
            }

        });

    });

    app.post('/usuario/eliminar', function (req, res){
        let criterio ={};
        if (Array.isArray(req.body.uid)){
            criterio = {"email" : {$in : req.body.uid}};
        }else{
            criterio = {"email" :  req.body.uid};
        }

        gestorBD.eliminarUsuario(criterio, function (usuarios){
            if (usuarios == null){
                req.session.errores = {mensaje:"Error al eliminar los usuarios",tipoMensaje:"alert-danger"};

                res.redirect("/errors");
            }else{
                if (Array.isArray(req.body.uid)){
                    criterio = {"seller" : {$in : req.body.uid}};
                }else{
                    criterio = {"seller" :  req.body.uid};
                }
                gestorBD.eliminarOferta(criterio, function (ofertas){
                   if (ofertas == null){
                       req.session.errores = {mensaje:"Error al eliminar los usuarios",tipoMensaje:"alert-danger"};

                       res.redirect("/errors");
                   } else{
                       res.redirect('/usuario/lista');
                   }
                });
            }
        });
    });

    app.get("/registrarse", function(req, res) {
        let respuesta = {};
        if (req.session.erroresRegistro == null){
            respuesta = swig.renderFile('views/bregistro.html', {});
        }else{
            respuesta = swig.renderFile('views/bregistro.html', {errores : req.session.erroresRegistro});
            req.session.erroresRegistro = null;
        }


        res.send(respuesta);
    });

    app.get("/identificarse", function(req, res) {
        let respuesta = {};
        req.session.usuario = null;
        req.session.role = null;

        if (req.session.errorLogin == null) {
            respuesta = swig.renderFile('views/bidentificacion.html', {});
        }else{
            respuesta = swig.renderFile('views/bidentificacion.html', {error : req.session.errorLogin});
            req.session.errorLogin = null;
        }
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
                req.session.role = null;
                req.session.money = null;
                req.session.errorLogin = "Email o password incorrecto";

                //req.session.errores = {mensaje:"Email o password incorrecto",tipoMensaje:"alert-danger"};

                res.redirect("/identificarse");
                //let respuesta = swig.renderFile('views/bidentificacion.html', {error : "Email o password incorrecto"})
                //res.send(respuesta);

            } else {

                req.session.usuario = usuarios[0].email;
                req.session.role = usuarios[0].role;
                req.session.money = usuarios[0].money;


                let respuesta = swig.renderFile("views/busuario.html", {
                    usuario : req.session.usuario,
                    role : req.session.role,
                    money : req.session.money
                });
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
        req.session.role = null;
        req.session.money = null;

        let respuesta = swig.renderFile('views/bidentificacion.html', {
            usuario : req.session.usuario,
            role : req.session.role,
            money : req.session.money
        });
        res.send(respuesta);
    });

    function validaDatosRegistro(usuario,confirmPassword, funcionCallback){
        let errors = new Array();

        if (usuario.password != confirmPassword){
            errors.push("La contraña no coincide en ambos campos.");
        }
        if (usuario.name.length < 1 || usuario.name.length > 20) {
            errors.push("El nombre ha de estar entre 1 y 20 caracteres.");
        }
        if (usuario.surname.length < 1 || usuario.surname.length > 20){
            errors.push("El apellido ha de estar entre 1 y 20 caracteres.");
        }
        if (errors.length <= 0){
            funcionCallback(null);
        }else{
            funcionCallback(errors);
        }
    }

}