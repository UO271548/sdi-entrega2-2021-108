module.exports = function(app, swig, gestorBD) {

    app.get('/pruebas', function (req, res){


        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update("admin").digest('hex');
        let admin = {
            name : "admin",
            surname : "admin",
            email : "admin@email.com",
            money : 100,
            password : seguro,
            role : 'Admin'

        }
        let usuario1 = {
            name : "Pedro",
            surname : "Díaz",
            email : "user1@gmail.com",
            money : 80,
            password : app.get("crypto").createHmac('sha256', app.get('clave'))
                .update("123456").digest('hex'),
            role : 'Estandar'

        }
        let usuario2 = {
            name : "Lucas",
            surname : "Núñez",
            email : "user2@gmail.com",
            money : 0,
            password : app.get("crypto").createHmac('sha256', app.get('clave'))
                .update("123456").digest('hex'),
            role : 'Estandar'

        }
        let usuario3 = {
            name : "María",
            surname : "Rodríguez",
            email : "user3@gmail.com",
            money : 15,
            password : app.get("crypto").createHmac('sha256', app.get('clave'))
                .update("123456").digest('hex'),
            role : 'Estandar'

        }
        let usuario4 = {
            name : "Marta",
            surname : "Almonte",
            email : "user4@gmail.com",
            money : 0,
            password : app.get("crypto").createHmac('sha256', app.get('clave'))
                .update("123456").digest('hex'),
            role : 'Estandar'

        }
        let usuario5 = {
            name : "Pelayo",
            surname : "Valdes",
            email : "user5@gmail.com",
            money : 67,
            password : app.get("crypto").createHmac('sha256', app.get('clave'))
                .update("123456").digest('hex'),
            role : 'Estandar'

        }


        let oferta1 = {
            title : "Mesa escritorio",
            description : "Mesa de escritorio de 80x40 cm",
            price : 30,
            seller : usuario1.email,
            buyer : usuario4.email,
            date : Date.now()
        }

        let oferta2 = {
            title : "Silla de oficina",
            description : "Silla perfecta para el ordenador. Muy comoda y ligera",
            price : 70,
            seller : usuario1.email,
            buyer : null,
            date : Date.now()
        }

        let oferta3 = {
            title : "Monitor",
            description : "Monitor 1080 para el ordenador",
            price : 50,
            seller : usuario1.email,
            buyer : usuario2.email,
            date : Date.now()
        }
        let oferta4 = {
            title : "Mi Smart Band 4",
            description : "Reloj Xiaomi Smart Band 4, puesto en muy pocas ocasiones",
            price : 18,
            seller : usuario2.email,
            buyer : usuario5.email,
            date : Date.now()
        }
        let oferta5 = {
            title : "Juego de maletas",
            description : "Juego de dos maletas o Bolsas de Viaje nuevas sin estrenar en su bolsa.",
            price : 5,
            seller : usuario2.email,
            buyer : usuario3.email,
            date : Date.now()
        }
        let oferta6 = {
            title : "PlayStation 4",
            description : "PlayStation 4 en muy buen estado.",
            price : 150,
            seller : usuario2.email,
            buyer : null,
            date : Date.now()
        }
        let oferta7 = {
            title : "IPHONE 7",
            description : "IPhone 7 en buen estado.",
            price : 100,
            seller : usuario3.email,
            buyer : null,
            date : Date.now()
        }
        let oferta8 = {
            title : "Libro El Imperio Final",
            description : "Libro de Brandon Sanderson el Imperio de Final de la saga Nacidos de la bruma.",
            price : 15,
            seller : usuario3.email,
            buyer : usuario5.email,
            date : Date.now()
        }
        let oferta9 = {
            title : "Videojuego FFIX",
            description : "Precintado con el envoltorio original.",
            price : 70,
            seller : usuario3.email,
            buyer : usuario4.email,
            date : Date.now()
        }
        let oferta10 = {
            title : "Cuenta RiotGames",
            description : "Level 30 en el Lol",
            price : 60,
            seller : usuario4.email,
            buyer : null,
            date : Date.now()
        }
        let oferta11 = {
            title : "Teclado Logitech",
            description : "Limpio y en muy buen estado. Casi no usado",
            price : 50,
            seller : usuario4.email,
            buyer : usuario2.email,
            date : Date.now()
        }
        let oferta12 = {
            title : "Zapatos de montaña",
            description : "Zapatos de montaña sin usar",
            price : 10,
            seller : usuario4.email,
            buyer : usuario1.email,
            date : Date.now()
        }
        let oferta13 = {
            title : "Xiaomi Redmi 7A Matte Blue",
            description : "Xiaomi Redmi 7A Matte Blue nuevo sin estrenar (precintado) 16GB y 2 Gb de RAM",
            price : 80,
            seller : usuario5.email,
            buyer : null,
            date : Date.now()
        }
        let oferta14 = {
            title : "Televisor Samsung",
            description : "Televisor de 43 pulgadas 4K.",
            price : 80,
            seller : usuario5.email,
            buyer : usuario3.email,
            date : Date.now()
        }
        let oferta15 = {
            title : "Chromecast",
            description : "Nuevo en el envoltorio original",
            price : 10,
            seller : usuario5.email,
            buyer : usuario1.email,
            date : Date.now()
        }

        let usuario = [admin, usuario1, usuario2, usuario3, usuario4, usuario5];
        let ofertas = [oferta1, oferta2, oferta3, oferta4, oferta5, oferta6, oferta7, oferta8, oferta9, oferta10,
                        oferta11, oferta12, oferta13, oferta14, oferta15];
        gestorBD.dropUsuarios(function (id){
            gestorBD.dropMensajes(function (id){
                gestorBD.dropOfertas(function (id){
                    gestorBD.dropConversaciones(function (id){
                        gestorBD.insertarUsuario(usuario, function (uids){
                            gestorBD.insertarOferta(ofertas, function (oids){
                                gestorBD.obtenerUsuarios({}, function (usuarios){
                                    gestorBD.obtenerOfertas({}, function (ofertas){
                                        let conversacion1 = {
                                            idUsuarioInteresado : usuarios[1]._id,
                                            idUsuarioPropetario : usuarios[2]._id,
                                            idOferta : ofertas[5]._id
                                        }
                                        let conversacion2 = {
                                            idUsuarioInteresado : usuarios[2]._id,
                                            idUsuarioPropetario : usuarios[3]._id,
                                            idOferta : ofertas[6]._id
                                        }
                                        let conversacion3 = {
                                            idUsuarioInteresado : usuarios[3]._id,
                                            idUsuarioPropetario : usuarios[4]._id,
                                            idOferta : ofertas[9]._id
                                        }
                                        let conversacion4 = {
                                            idUsuarioInteresado : usuarios[4]._id,
                                            idUsuarioPropetario : usuarios[5]._id,
                                            idOferta : ofertas[12]._id
                                        }
                                        let conversacion5 = {
                                            idUsuarioInteresado : usuarios[5]._id,
                                            idUsuarioPropetario : usuarios[1]._id,
                                            idOferta : ofertas[1]._id
                                        }
                                        let conversaciones = [conversacion1, conversacion2, conversacion3, conversacion4, conversacion5];
                                        gestorBD.insertarConversacion(conversaciones, function (cids){
                                            gestorBD.obtenerConversaciones({}, function (conversaciones){
                                                let mensaje1 = {
                                                    idConversacion : conversaciones[0]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Hola",
                                                    leido : false,
                                                    emisor : usuario1.email
                                                };

                                                let mensaje2 = {
                                                    idConversacion : conversaciones[0]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Me interesa",
                                                    leido : false,
                                                    emisor : usuario1.email
                                                };

                                                let mensaje3 = {
                                                    idConversacion : conversaciones[0]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Buenas",
                                                    leido : false,
                                                    emisor : usuario2.email
                                                };

                                                let mensaje4 = {
                                                    idConversacion : conversaciones[0]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Es muy buen producto",
                                                    leido : false,
                                                    emisor : usuario2.email
                                                };

                                                let mensaje5 = {
                                                    idConversacion : conversaciones[1]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Buenas Tardes",
                                                    leido : false,
                                                    emisor : usuario2.email
                                                };

                                                let mensaje6 = {
                                                    idConversacion : conversaciones[1]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Se podria bajar el precio",
                                                    leido : false,
                                                    emisor : usuario2.email
                                                };

                                                let mensaje7 = {
                                                    idConversacion : conversaciones[1]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Hola",
                                                    leido : false,
                                                    emisor : usuario3.email
                                                };

                                                let mensaje8 = {
                                                    idConversacion : conversaciones[1]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "No, no se puede",
                                                    leido : false,
                                                    emisor : usuario3.email
                                                };

                                                let mensaje9 = {
                                                    idConversacion : conversaciones[2]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Buenas Dias",
                                                    leido : false,
                                                    emisor : usuario3.email
                                                };

                                                let mensaje10 = {
                                                    idConversacion : conversaciones[2]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Necesito saber cuando lo podria recoger",
                                                    leido : false,
                                                    emisor : usuario3.email
                                                };

                                                let mensaje11 = {
                                                    idConversacion : conversaciones[2]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Buenas",
                                                    leido : false,
                                                    emisor : usuario4.email
                                                };

                                                let mensaje12 = {
                                                    idConversacion : conversaciones[2]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Cualquier dia de esta semana",
                                                    leido : false,
                                                    emisor : usuario4.email
                                                };

                                                let mensaje13 = {
                                                    idConversacion : conversaciones[3]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Saludos",
                                                    leido : false,
                                                    emisor : usuario4.email
                                                };

                                                let mensaje14 = {
                                                    idConversacion : conversaciones[3]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Tiene algun tipo de problema",
                                                    leido : false,
                                                    emisor : usuario4.email
                                                };

                                                let mensaje15 = {
                                                    idConversacion : conversaciones[3]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "No",
                                                    leido : false,
                                                    emisor : usuario5.email
                                                };

                                                let mensaje16 = {
                                                    idConversacion : conversaciones[3]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Esta en perfecto estado",
                                                    leido : false,
                                                    emisor : usuario5.email
                                                };

                                                let mensaje17 = {
                                                    idConversacion : conversaciones[4]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Me gustaria probarla antes",
                                                    leido : false,
                                                    emisor : usuario5.email
                                                };

                                                let mensaje18 = {
                                                    idConversacion : conversaciones[4]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Si es posible",
                                                    leido : false,
                                                    emisor : usuario5.email
                                                };

                                                let mensaje19 = {
                                                    idConversacion : conversaciones[4]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Si",
                                                    leido : false,
                                                    emisor : usuario1.email
                                                };

                                                let mensaje20 = {
                                                    idConversacion : conversaciones[4]._id,
                                                    fecha : Date.now(),
                                                    mensaje : "Puedes probarla si quieres",
                                                    leido : false,
                                                    emisor : usuario1.email
                                                };
                                                let mensajes = [mensaje1, mensaje2, mensaje3, mensaje4, mensaje5, mensaje6, mensaje7,
                                                    mensaje8, mensaje9, mensaje10, mensaje11, mensaje12, mensaje13, mensaje14,
                                                    mensaje15, mensaje16, mensaje17, mensaje18, mensaje19, mensaje20];

                                                gestorBD.insertarMensaje(mensajes, function (mids){
                                                    res.redirect('/inicio');
                                                })
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                    });
                });
            });
        });



}