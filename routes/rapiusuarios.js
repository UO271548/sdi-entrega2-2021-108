module.exports = function (app, gestorBD, logger){

    /**
     * Peticíon que realiza la identificación de un usuario en la aplicación y crea un token para el usuario identificado
     */
    app.post("/api/identificarse", function(req, res) {
        logger.info("Accediendo a la identificacion de usuarios");
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email : req.body.email,
            password : seguro
        }
        let usuario = {email : req.body.email, password : req.body.password};
        validaDatosLogin(usuario, function (errores) {
            if (errores != null && errores.length > 0) {
                logger.error("Error al validar los datos de identificacion");
                res.status(403);
                res.json({
                    errores: errores
                })

            } else {
                gestorBD.obtenerUsuarios(criterio, function(usuarios) {
                    if (usuarios == null || usuarios.length == 0) {
                        logger.error("Error al validar los datos de identificacion");
                        res.status(401);
                        res.json({
                            errores : ["Email o contraseña incorrectos"],
                            autenticado : false
                        })
                    } else {

                        req.session.usuario = req.body.email;
                        let token = app.get('jwt').sign(
                            {usuario: criterio.email , tiempo: Date.now()/1000},
                            "secreto");
                        res.status(200);
                        res.json({
                            autenticado: true,
                            token : token
                        });
                    }
                });
            }
        });

    });

    /**
     * Petición para acceder a la vista donde se encuenta la lista de oferta en la aplicación no pertenecientes al
     * usuario identificado.
     */
    app.get('/api/oferta/lista' , function (req, res){
        logger.info("Accediendo a la lista de ofertas");
        let criterio = {"seller": {$ne : req.session.usuario}};
        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            if (ofertas == null) {
                logger.error("Error al acceder a la lista de ofertas");
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                });
            } else {
                res.status(200);
                res.send(JSON.stringify(ofertas));
            }
        });
    });

    /**
     * Petición para enviar un mensaje al vendedor de la oferta en la cual el usuario esta interesado. En caso de que este
     * sea el primer mensaje que envia se creara una conversación entre los dos usuarios a la cual se le añadirán los
     * mensajes posteriores.
     */
    app.put('/api/oferta/chat/:id' , function (req, res){
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerOfertas(criterio, function (oferta){
            if ( oferta == null ){
                logger.error("Error las ofertas");
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                });
            } else {
                let criterio = {"email" : oferta[0].seller};
                gestorBD.obtenerUsuarios(criterio, function (vendedor){
                    if (vendedor == null){
                        logger.error("Error al obtener los usuarios");
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        });
                    } else{
                        let criterio = {"email" : res.usuario};
                        gestorBD.obtenerUsuarios(criterio, function (interesado){
                            if (interesado == null){
                                logger.error("Error al obtener los usuarios");
                                res.status(500);
                                res.json({
                                    error: "se ha producido un error"
                                });
                            }else{
                                let criterio = {$and : [{"idUsuarioInteresado" : interesado[0]._id},
                                        {"idUsuarioPropetario" : vendedor[0]._id,
                                            "idOferta" : gestorBD.mongo.ObjectID(req.params.id)}]};
                                gestorBD.obtenerConversaciones(criterio, function (conversaciones){
                                   if (conversaciones[0] ==  undefined){

                                       let chat = {
                                           idUsuarioInteresado : interesado[0]._id,
                                           idUsuarioPropetario : vendedor[0]._id,
                                           idOferta : oferta[0]._id

                                       }
                                       gestorBD.insertarConversacion(chat,function (id){
                                           if (id == null){
                                               logger.error("Error insertando la conversacion");
                                               res.status(500);
                                               res.json({
                                                   error: "se ha producido un error"
                                               });
                                           } else{
                                               logger.info("Conversacion insertado");
                                               let mensaje = {
                                                   idConversacion : id,
                                                   fecha : Date.now(),
                                                   mensaje : req.body.mensaje,
                                                   leido : false,
                                                   emisor : res.usuario
                                               }
                                               gestorBD.insertarMensaje(mensaje,function (id){
                                                   if (id == null){
                                                       logger.error("Error insertando el mensaje");
                                                       res.status(500);
                                                       res.json({
                                                           error: "se ha producido un error"
                                                       });
                                                   } else{
                                                       logger.info("Mensaje insertado");
                                                       res.status(200);
                                                       res.json({
                                                           mensaje: "chat insertado",
                                                           _id: id
                                                       });
                                                   }
                                               });
                                           }
                                       });

                                   } else{
                                       let mensaje = {
                                           idConversacion : conversaciones[0]._id,
                                           fecha : Date.now(),
                                           mensaje : req.body.mensaje,
                                           leido : false,
                                           emisor : res.usuario
                                       }
                                       gestorBD.insertarMensaje(mensaje, function (id){
                                          if (id == null){
                                              logger.error("Error insertando el mensaje");
                                              res.status(500);
                                              res.json({
                                                  error: "se ha producido un error"
                                              });
                                          } else{
                                              logger.info("Mensaje insertado");
                                              res.status(200);
                                              res.json({
                                                  mensaje: "chat insertado",
                                                  _id: id
                                              });
                                          }
                                       });
                                   }
                                });

                            }
                        });
                    }
                });
            }
        });
    });

    /**
     * Petición para obtener la lista de mensajes que un usario ha enviado a una conversación por un oferta en la cual
     * esta interesado.
     */
    app.get('/api/oferta/mensajes/:id', function (req, res){
        logger.info("Accediendo a la lista de mensajes");
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerOfertas(criterio, function(oferta){
            if (oferta == null){
                logger.error("Error al obtener las ofertas");
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                });
            } else{
                let criterio = {"email" :  req.session.usuario};
                gestorBD.obtenerUsuarios(criterio, function (usuario){
                    if (usuario == null){
                        logger.error("Error al obtener los usuarios");
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        });
                    }else{
                        let criterio = {$and : [{"idOferta" : gestorBD.mongo.ObjectID(req.params.id)},
                                {"idUsuarioInteresado" : usuario[0]._id}]};
                        gestorBD.obtenerConversaciones(criterio, function (conversaciones){
                            if (conversaciones == null){
                                logger.error("Error al obtener las conversaciones");
                                res.status(500);
                                res.json({
                                    error: "se ha producido un error"
                                });
                            } else{
                                if (conversaciones[0] != undefined) {
                                    let criterio = {"idConversacion": conversaciones[0]._id};
                                    gestorBD.obtenerMensaje(criterio, function (mensajes) {
                                        if (mensajes == null) {
                                            logger.error("Error al obtener los mensajes");
                                            res.status(500);
                                            res.json({
                                                error: "se ha producido un error"
                                            });
                                        } else {
                                            res.status(200);
                                            res.send(JSON.stringify(mensajes));
                                        }
                                    });
                                }else{
                                    let mensajes ={};
                                    res.status(200);
                                    res.send(JSON.stringify(mensajes));
                                }
                            }
                        });
                    }
                })

            }
        });
    });

    /**
     * Petición que devuelve la lista de conversacion abiertas actuales del usuario identificado en la aplicación
     */
    app.get('/api/oferta/chat/lista', function (req, res){
        logger.info("Accediendo a la lista de conversaciones");
       let criterio = {"email" : res.usuario};

       gestorBD.obtenerUsuarios(criterio, function (usuario){
           if (usuario == null){
               logger.error("Error al obtener los mensajes");
               res.status(500);
               res.json({
                   error: "se ha producido un error"
               });
           }else{

               let criterio = {"idUsuarioInteresado" : usuario[0]._id};

               gestorBD.obtenerConversaciones(criterio, function (chatsInteresado){
                   if (chatsInteresado == null){
                       logger.error("Error al obtener las conversaciones");
                       res.status(500);
                       res.json({
                           error: "se ha producido un error"
                       });
                   }else{
                       let criterio = {"idUsuarioPropetario" : usuario[0]._id};

                       gestorBD.obtenerConversaciones(criterio, function (chatsVendedor){
                           if (chatsVendedor == null){
                               logger.error("Error al obtener las conversaciones");
                               res.status(500);
                               res.json({
                                   error: "se ha producido un error"
                               });
                           }else{
                               let conversaciones = new Array();
                               conversaciones.concat(chatsInteresado, chatsVendedor)
                               res.status(200);
                               res.send(JSON.stringify(conversaciones));
                           }
                       });

                   }
               });
           }
       });

    });

    /**
     * Petición para realizar el borrado de una conversación y con ello todos los mensjes que se encuentren vinculados a
     * ella.
     */
    app.delete("/api/oferta/chat/:id", function (req, res) {
        logger.info("Accediendo al borrado de mensajes");
        let idConver = gestorBD.mongo.ObjectID(req.params.id);

        let criterio = {"_id": idConver}
        usuarioEsInteresadoOVendedor(idConver, res.usuario, function (errors){
            if (errors != null && errors.length > 0) {
                logger.error("Error al compobar si es interesado o Vendedor");
                res.status(403);
                res.json({
                    errores: errors
                })
            }else{
                gestorBD.eliminarConversacion(criterio, function (conversaciones) {
                    if (conversaciones == null) {
                        logger.error("Error al eliminar una conversacion");
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                    } else {
                        let criterio = {"idConversacion" : idConver};
                        gestorBD.eliminarMensaje(criterio, function (mensajes){
                            if (mensajes == null){
                                logger.error("Error al eliminar un mensaje");
                                res.status(500);
                                res.json({
                                    error: "se ha producido un error"
                                })
                            }else{
                                logger.info("Convesacion eliminada");
                                res.status(200);
                                res.send(JSON.stringify(conversaciones));
                            }
                        });

                    }
                });
            }
        });

    });

    /**
     * Petición para realizar la modificación de un mensaje y marcar este como leido.
     */
    app.put("/api/oferta/mensaje/:id", function (req, res) {
        logger.info("Modificando mensaje como leido");
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        let mensaje = {leido : true};
        gestorBD.obtenerMensaje(criterio, function (mensajes){
            if (mensajes == null){
                logger.error("Error al obtener los mensajes");
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            }else{
                usuarioEsInteresadoOVendedor(mensajes[0].idConversacion, res.usuario, function (errors){
                    if (errors != null && errors.length > 0) {
                        logger.error("Error al compobar si es interesado o Vendedor");
                        res.status(403);
                        res.json({
                            errores: errors
                        })

                    } else {
                        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
                        gestorBD.modificarMensaje(criterio, mensaje, function (result) {
                            if (result == null) {
                                logger.error("Error al modificar el mensaje");
                                res.status(500);
                                res.json({
                                    error: "se ha producido un error"
                                })
                            } else {
                                logger.info("Mensaje modificado");
                                res.status(200);
                                res.json({
                                    mensaje: "mensaje modificado",
                                    _id: req.params.id
                                })
                            }
                        });
                    }
                });
            }


        });


    });

    /**
     * Función para la validación de los datos introducidos en la identificación de un usuario  en la aplicación.
     * @param usuario el usuario a validar
     * @param funcionCallback
     */
    function validaDatosLogin(usuario, funcionCallback){
        let errores = new Array();
        if (usuario.email.length == 0){
            errores.push("El campo email no puede ser vacio.");
        }
        if (usuario.password.length == 0){
            errores.push("El campo contraseña no puede ser vacio.")
        }

        funcionCallback(errores);
    }

    /**
     * Función que devuelve un errore en cado de que un usuario no sea el interesado o vendedor de una conversación
     * pasada por paramentro.
     * @param conversacion la conversación a validar
     * @param usuario el posible usuario intereseado o vendedor.
     * @param funcionCallback
     */
    function usuarioEsInteresadoOVendedor(conversacion, usuario, funcionCallback) {
        let errors = new Array();
        let criterio = {"_id": conversacion};
        gestorBD.obtenerConversaciones(criterio, function (conversaciones) {
            if (conversaciones.length > 0 || conversaciones == null) {
                let ids = new Array();
                ids.push(conversaciones[0].idUsuarioInteresado);
                ids.push(conversaciones[0].idUsuarioPropetario);
                let criterio = {$and : [{"email" : usuario, "_id": {$in : ids}}]};
                gestorBD.obtenerUsuarios(criterio, function (usuario){
                    if (usuario.length > 0 || usuario == null){
                        funcionCallback(errors);
                    }else{
                        errors.push("El usuario no participa en esta coversacion.");
                        funcionCallback(errors);
                    }
                });

            } else {
                errors.push("El usuario no participa en esta coversacion.");
                funcionCallback(errors);
            }
        });
    }

}