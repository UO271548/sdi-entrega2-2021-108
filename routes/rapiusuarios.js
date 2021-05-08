module.exports = function (app, gestorBD){

    app.post("/api/identificarse/", function(req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email : req.body.email,
            password : seguro
        }
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {

                res.status(401);
                res.json({
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
    });

    app.get('/api/oferta/lista' , function (req, res){
        let criterio = {"seller": {$ne : req.session.usuario}};
        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            if (ofertas == null) {
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

    app.put('/api/oferta/chat/:id' , function (req, res){
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerOfertas(criterio, function (oferta){
            if ( oferta == null ){
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                });
            } else {
                let criterio = {"email" : oferta[0].seller};
                gestorBD.obtenerUsuarios(criterio, function (vendedor){
                    if (vendedor == null){
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        });
                    } else{
                        let criterio = {"email" : res.usuario};
                        gestorBD.obtenerUsuarios(criterio, function (interesado){
                            if (interesado == null){
                                res.status(500);
                                res.json({
                                    error: "se ha producido un error"
                                });
                            }else{
                                let chat = {
                                    idUsuarioInteresado : interesado[0]._id,
                                    idUsuarioPropetario : vendedor[0]._id,
                                    idOferta : oferta[0]._id,
                                    mensaje : req.body.mensaje,
                                    fecha : Date.now(),
                                    leido : false,
                                    emisor : res.usuario
                                }
                                gestorBD.insertarConversacion(chat,function (id){
                                    if (id == null){
                                        res.status(500);
                                        res.json({
                                            error: "se ha producido un error"
                                        });
                                    } else{
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
    });

    app.get('/api/oferta/mensajes/:id', function (req, res){
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerOfertas(criterio, function(oferta){
            if (oferta == null){
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                });
            } else{
                let criterio = {"email" :  req.session.usuario};
                gestorBD.obtenerUsuarios(criterio, function (usuario){
                    if (usuario == null){
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        });
                    }else{
                        let criterio = {$and : [{"idOferta" : gestorBD.mongo.ObjectID(req.params.id)},
                                {"idUsuarioInteresado" : usuario[0]._id}]};
                        gestorBD.obtenerConvaciones(criterio, function (conversaciones){
                            if (conversaciones == null){
                                res.status(500);
                                res.json({
                                    error: "se ha producido un error"
                                });
                            } else{
                                res.status(200);
                                res.send(JSON.stringify(conversaciones));
                            }
                        });
                    }
                })

            }
        });
    });
}