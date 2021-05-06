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
                let respuesta = swig.renderFile('views/bregistro.html',{
                    errores : errors
                });
                res.send(respuesta);
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
                res.send("Error al listar");
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

    app.get('/usuario/eliminar', function (req, res){
        //console.log(req.body); //Output=> like { searchid: 'Array of checked checkbox' }
        //console.log(req.body.searchid); // to get array of checked checkbox
        console.log(req.session.check)
        //console.log(document.getElementsByClassName("prueba"));
        res.redirect("/usuario/lista");
    });

    app.get("/registrarse", function(req, res) {
        let respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });

    app.get("/identificarse", function(req, res) {
        req.session.usuario = null;
        req.session.role = null;
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
                req.session.role = null;
                req.session.money = null;

                //req.session.errores = {mensaje:"Email o password incorrecto",tipoMensaje:"alert-danger"};

                //res.redirect("/identificarse");
                let respuesta = swig.renderFile('views/bidentificacion.html', {error : "Email o password incorrecto"})
                res.send(respuesta);

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