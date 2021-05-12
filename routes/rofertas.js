module.exports = function(app, swig, gestorBD, logger) {

    /**
     * Petición para eliminar una oferta y con ello todos los elementos relacionados( conversaciones y mensajes).
     */
    app.get('/oferta/eliminar/:id', function (req, res) {
        logger.info("Eliminando Oferta");
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.eliminarOferta(criterio,function(ofertas){
            if ( ofertas == null ){
                logger.error("Error al eliminar la oferta.");
                req.session.errores = {mensaje:"Error al eliminar la oferta.",tipoMensaje:"alert-danger"};

                res.redirect("/errors");
            } else {
                let criterio = {"idOferta" : gestorBD.mongo.ObjectID(req.params.id)};
                gestorBD.obtenerConversaciones(criterio, function (conversaciones1) {
                    gestorBD.eliminarConversacion(criterio, function (conversaciones){
                        if (conversaciones == null){
                            logger.error("Error al eliminar las conversaciones de la oferta.");
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
                                    logger.error("Error al eliminar los mensajes de la oferta.");
                                    req.session.errores = {mensaje:"Error al eliminar los mensajes de la oferta.",tipoMensaje:"alert-danger"};

                                    res.redirect("/errors");
                                } else{
                                    logger.info("Oferta Eliminada");
                                    res.redirect("/oferta/lista");
                                }
                            });
                        }
                    });
                });

            }
        });
    })

    /**
     * Petición para mostrar la vista con el formulario para agregar una nueva oferta.
     */
    app.get('/oferta/agregar', function (req, res){
        logger.error("Accediendo a agregar oferta");
        let respuesta = {};
        if (req.session.errorAgregarOferta == null) {
            respuesta = swig.renderFile('views/bagregarOferta.html', {
                usuario: req.session.usuario,
                role: req.session.role,
                money: req.session.money
            });
        }else{
            respuesta = swig.renderFile('views/bagregarOferta.html', {
                usuario: req.session.usuario,
                role: req.session.role,
                money: req.session.money,
                errores : req.session.errorAgregarOferta
            });
        }
        req.session.errorAgregarOferta = null;
        res.send(respuesta);
    });
    /**
     * Petición para realizar la agregación de una oferta a la aplicación. Verifica que los datos introducudos sean
     * correctos.
     */
    app.post('/oferta/agregar', function (req, res){
        let oferta = {};
        if (req.body.destacada != undefined){
            oferta = {
                title : req.body.title,
                description : req.body.description,
                price : req.body.price,
                seller : req.session.usuario,
                buyer : null,
                date : Date.now(),
                outstanding : true
            }
        }else {
            oferta = {
                title : req.body.title,
                description : req.body.description,
                price : req.body.price,
                seller : req.session.usuario,
                buyer : null,
                date : Date.now(),
                outstanding : false
            }
        }

        validaDatosAgregarOferta(oferta, function (errors){
            if (errors != null && errors.length > 0){
                req.session.errorAgregarOferta = errors;
                res.redirect('/oferta/agregar');
            }else {
                if (req.session.money > 20) {
                    gestorBD.insertarOferta(oferta, function (id) {
                        if (id == null) {
                            logger.error("Error al eliminar los mensajes de la oferta.");
                            req.session.errores = {
                                mensaje: "Error al insertar la oferta",
                                tipoMensaje: "alert-danger"
                            };

                            res.redirect("/errors");
                        } else {
                            let criterio = {"email": req.session.usuario};
                            gestorBD.obtenerUsuarios(criterio, function (usuarios) {
                                if (usuarios == null) {
                                    logger.error("Error al insertar la oferta");
                                    req.session.errores = {
                                        mensaje: "Error al insertar la oferta",
                                        tipoMensaje: "alert-danger"
                                    };
                                } else {
                                    logger.info("Oferta agregada");
                                    req.session.money = req.session.money - 20;
                                    res.redirect('/oferta/lista');
                                }
                            });
                        }
                    });
                }else{
                    logger.error("Error al insertar la oferta");
                    req.session.errorAgregarOferta=["No tienes suficiente dinero para hacer destacada esa oferta."];
                    res.redirect("/oferta/agregar");
                }
            }
        });


    });
    /**
     * Petición que se encarga de modificar una oferta para que esta sea destacada.
     */
    app.get('/oferta/destacada/:id', function(req, res){
        logger.info("Destacando oferta");
        let oferta = {outstanding : true};
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id)};
        if (req.session.money > 20){
            gestorBD.modificarOferta(criterio, oferta,function (id){
                if (id == null){
                    logger.error("Error al hacer la oferta destacada");
                    req.session.errores = {
                        mensaje: "Error al hacer la oferta destacada",
                        tipoMensaje: "alert-danger"
                    };
                }else{
                    req.session.money = req.session.money - 20;
                    let usuario = {money : req.session.money};
                    let criterio = {"email" : req.session.usuario}
                    gestorBD.modificarUsuario(criterio, usuario, function (id){
                        if (id == null){
                            req.session.errores = {
                                mensaje: "Error al hacer la oferta destacada",
                                tipoMensaje: "alert-danger"
                            };
                        }else{
                            logger.info("Oferta destacada");
                            res.redirect("/oferta/lista");
                        }
                    });

                }
            });
        }else{
            req.session.errorOfertaDestacada=["No tienes suficiente dinero para hacer destacada esa oferta."];
            res.redirect("/oferta/lista");
        }
    });

    /**
     * Peticion que muestra la vista con las ofertas creadas en la aplicación por el usuario identificado. Cada oferta
     * cuenta con un enlace para eliminar la oferta de la aplicación.
     */
    app.get('/oferta/lista', function (req, res){
        logger.info("Accediendo a la lista oferta");
        let criterio = {"seller" : req.session.usuario};
        gestorBD.obtenerOfertas(criterio, function (ofertas){
            if (ofertas == null){
                logger.error("Error al cargar la lista de oferta");
                req.session.errores = {mensaje:"Error al cargar la lista de ofertas,",tipoMensaje:"alert-danger"};

                res.redirect("/errors");
            }else{
                if (req.session.errorOfertaDestacada == null) {
                    let respuesta = swig.renderFile('views/blistaOfertas.html',
                        {
                            ofertas: ofertas,
                            usuario: req.session.usuario,
                            role: req.session.role,
                            money: req.session.money
                        });
                    res.send(respuesta);
                }else{
                    let respuesta = swig.renderFile('views/blistaOfertas.html',
                        {
                            ofertas: ofertas,
                            usuario: req.session.usuario,
                            role: req.session.role,
                            money: req.session.money,
                            errores : req.session.errorOfertaDestacada
                        });
                    res.send(respuesta);
                }
            }

        });
    });

    /**
     * Función que se encarga de validar los datos de una oferta pasada como parámetro antes que se añada a la aplicación
     * @param oferta la oferta a comprabar sus parametros
     * @param funcionCallback
     */
    function validaDatosAgregarOferta(oferta,funcionCallback){
        let errors = new Array();
        if (oferta.title.length == 0){
            errors.push("El campo del titulo no puede ser vacío.");
        }
        if (oferta.description.length == 0){
            errors.push("El campo de la descripción no puede ser vacío.");
        }
        if (oferta.price.length == 0){
            errors.push("El campo del precio no puede ser vacío.");
        }
        if (oferta.title.length < 8 || oferta.title.length > 24){
            errors.push("El titulo debe tener entre 7 y 20 caracteres.");
        }
        if (oferta.description.length < 8 || oferta.description.length > 60){
            errors.push("La descripcion debe tener entre 7 y 60 caracteres.");
        }
        if (oferta.price < 0 ){
            errors.push("El precio no puede ser negativo.");
        }
        if (errors.length <= 0){
            funcionCallback(null);
        }else{
            funcionCallback(errors);
        }
    }


}