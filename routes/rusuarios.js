module.exports = function(app, swig, gestorBD, logger) {

    /**
     * Petición para acceder a la pagina principal de la aplicación.
     */
    app.get('/inicio', function (req,res){
        logger.info("Accediendo a la página de inicio");
        let respuesta = swig.renderFile("views/busuario.html", {
            usuario : req.session.usuario,
            role : req.session.role,
            money : req.session.money
        });
        res.send(respuesta);
    });

    /**
     * Petición para realizar el registro de un usuario. Valida los datos introducidos por el usuario y en caso de que
     * estos sean correctos identificará al usuario automaticamente y lo redigirá a la pagina de inicio.
     */
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
                logger.error("Error al validar los datos de registro");
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

                        logger.info("Usuario registrado");
                        res.redirect('/inicio');
                    }
                });
            }
        });
    });

    /**
     * Petición que muesta la lista de usuarios no Admin en la aplicación(Solo accesible por usuarios Admin). En cada usuario
     * se encuentra un "checkbox" para seleccionarlo y asi poder borrarlo haciendo uso del boton Eliminar de esa vista.
     */
    app.get('/usuario/lista', function (req, res){
        logger.info("Accediendo a la lista de usuarios");
        let criterio = {"role" : "Estandar"};
        gestorBD.obtenerUsuarios(criterio, function (usuarios){
            if (usuarios == null){
                logger.error("Error al obtener los usuarios");
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

    /**
     * Petición para realizar la eliminacion de un usuario en la aplicacion y con ello todos los elementos en los que
     * interviene(ofertas, conversaciones y mensajes).
     */
    app.post('/usuario/eliminar', function (req, res){
        logger.info("Eliminando Usuario");
        let criterio ={};
        if (Array.isArray(req.body.uid)){
            criterio = {"email" : {$in : req.body.uid}};
        }else{
            criterio = {"email" :  req.body.uid};
        }

        gestorBD.eliminarUsuario(criterio, function (usuarios){
            if (usuarios == null){
                logger.error("Error al eliminar el usuario");
                req.session.errores = {mensaje:"Error al eliminar los usuarios",tipoMensaje:"alert-danger"};

                res.redirect("/errors");
            }else{
                if (Array.isArray(req.body.uid)){
                    criterio = {"seller" : {$in : req.body.uid}};
                }else{
                    criterio = {"seller" :  req.body.uid};
                }
                gestorBD.obtenerOfertas(criterio, function (ofertas1){
                    gestorBD.eliminarOferta(criterio, function (ofertas){
                        if (ofertas == null){
                            logger.error("Error al eliminar las ofertas del usuarios");
                            req.session.errores = {mensaje:"Error al eliminar las ofertas del usuarios",tipoMensaje:"alert-danger"};

                            res.redirect("/errors");
                        } else{
                            let idos = new Array();
                            for (let i = 0; i < ofertas1.length; i++){
                                idos.push(ofertas1[i]._id);
                            }
                            criterio = {"idOferta" : {$in : idos}};
                            gestorBD.obtenerConversaciones(criterio, function (conversaciones1) {
                                gestorBD.eliminarConversacion(criterio, function (conversaciones){
                                    if (conversaciones == null){
                                        logger.error("Error al eliminar las conversaciones de la oferta");
                                        req.session.errores = {mensaje:"Error al eliminar las conversaciones de la oferta.",tipoMensaje:"alert-danger"};

                                        res.redirect("/errors");
                                    }else{

                                        let idcs = new Array();
                                        for (let i = 0; i < conversaciones1.length; i++){
                                            idcs.push(conversaciones1[i]._id);
                                        }
                                        let  criterio = {"idConversacion":{ $in : idcs}};
                                        gestorBD.eliminarMensaje(criterio, function (mensajes){
                                            if (mensajes == null){
                                                logger.error("Error al eliminar los mensajes de la oferta");
                                                req.session.errores = {mensaje:"Error al eliminar los mensajes de la oferta.",tipoMensaje:"alert-danger"};

                                                res.redirect("/errors");
                                            } else{
                                                logger.error("Usuario Eliminado");
                                                res.redirect("/usuario/lista");
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    });
                });

            }
        });
    });

    /**
     * Petición que muestra la vista de registro de usuario.
     */
    app.get("/registrarse", function(req, res) {
        logger.error("Accediendo al registro de un usuario");
        let respuesta = {};
        if (req.session.erroresRegistro == null){
            respuesta = swig.renderFile('views/bregistro.html', {});
        }else{
            respuesta = swig.renderFile('views/bregistro.html', {errores : req.session.erroresRegistro});
            req.session.erroresRegistro = null;
        }


        res.send(respuesta);
    });

    /**
     * Petición que muestra la vista de identificaion de usuarios.
     */
    app.get("/identificarse", function(req, res) {
        logger.info("Accediendo a la identificacion de un usuario");
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

    /**
     * Petición que realiza la identificacion de un usuario en la aplicacion. Valida los datos y en caso de que estos
     * sean correctos redirige al usuario a la pagina principal de la aplicacion.
     */
    app.post("/identificarse", function(req, res) {

        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email : req.body.email,
            password : seguro
        }
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                logger.error("Error al identificar el usuario");
                req.session.usuario = null;
                req.session.role = null;
                req.session.money = null;
                req.session.errorLogin = "Email o contraseña incorrecto";

                res.redirect("/identificarse");

            } else {
                logger.info("Usuario identificado");
                req.session.usuario = usuarios[0].email;
                req.session.role = usuarios[0].role;
                req.session.money = usuarios[0].money;

                res.redirect('/inicio');

            }
        });
    });

    /**
     * Petición que muestra la vista de errores de la aplicacion
     */
    app.get("/errors", function(req, res) {
        let respuesta = swig.renderFile('views/error.html',
            {
                mensaje : req.session.errores.mensaje,
                tipoMensaje : req.session.errores.tipoMensaje
            });
        res.send(respuesta);
    });


    /**
     * Petición que realiza la desconexion de un usuario identificado en la aplicacion
     */
    app.get('/desconectarse', function (req, res) {
        logger.info("Desconectando usuario");
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

    /**
     * Función que valida los datos de un usuario pasado como parametro para el registro de dicho usuario. Comprueba las
     * logitudes de su nombre, apellido, email y contraseñas
     * @param usuario usuario a validar los datos en el registro
     * @param confirmPassword la confirmación de la contraseña.
     * @param funcionCallback
     */
    function validaDatosRegistro(usuario,confirmPassword, funcionCallback){
        let errors = new Array();
        if(usuario.name.length == 0){
            errors.push("El campo Nombre no puede ser vacio.");
        }
        if (usuario.surname.length == 0){
            errors.push("El campo Apellido no puede ser vacio.");
        }
        if (usuario.email.length == 0){
            errors.push("El campo Email no puede ser vacio.");
        }
        if (usuario.password.length == 0){
            errors.push("El campo Contraseña no puede ser vacio.");
        }
        if (confirmPassword == undefined){
            errors.push("El campo Confirmar Contraseña no puede ser vacio.");
        }
        if (usuario.password != confirmPassword){
            errors.push("La contraña no coincide en ambos campos.");
        }
        if (usuario.name.length < 5 || usuario.name.length > 20) {
            errors.push("El nombre ha de estar entre 5 y 20 caracteres.");
        }
        if (usuario.surname.length < 5 || usuario.surname.length > 20){
            errors.push("El apellido ha de estar entre 5 y 20 caracteres.");
        }
        let criterio = {"email" : usuario.email};
        gestorBD.obtenerUsuarios(criterio, function (usuarioRe){
           if (usuarioRe != null && usuarioRe.length > 0){
               errors.push("El email introducido ya existe en otra cuenta.");

           }
            if (errors.length <= 0){
                funcionCallback(null);
            }else{
                funcionCallback(errors);
            }
        });

    }

}