module.exports = {
    mongo : null,
    app : null,
    init : function(app, mongo) {
        this.mongo = mongo;
        this.app = app;
    },
    /**
     * Función para modificar un mensaje en la base de datos
     * @param criterio el criterio para buscar el mensaje
     * @param mensaje los datos modificados del mensaje
     * @param funcionCallback
     */
    modificarMensaje : function(criterio, mensaje, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('mensajes');
                collection.update(criterio, {$set: mensaje}, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },

    /**
     * Función para eliminar un mensaje en la base de datos
     * @param criterio el criterio para buscar el mensaje
     * @param funcionCallback
     */
    eliminarMensaje : function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('mensajes');
                collection.remove(criterio, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },

    /**
     * Función para eliminar una conversación en la base de datos
     * @param criterio el criterio para buscar el mensaje
     * @param funcionCallback
     */
    eliminarConversacion : function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('conversaciones');
                collection.remove(criterio, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Función para eliminar la tabla mensajes en la base de datos
     * @param funcionCallback
     */
    dropMensajes: function(funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('mensajes');
                collection.drop( function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Función para eliminar la tabla conversaciones en la base de datos
     * @param funcionCallback
     */
    dropConversaciones: function(funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('conversaciones');
                collection.drop( function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Función para eliminar la tabla ofertas en la base de datos
     * @param funcionCallback
     */
    dropOfertas: function(funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('ofertas');
                collection.drop( function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Función para eliminar la tabla usuarios en la base de datos
     * @param funcionCallback
     */
    dropUsuarios: function(funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('usuarios');
                collection.drop( function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Función para obtener los mensajes según un criterio de la base de datos.
     * @param criterio el criterio para buscar los mensajes
     * @param funcionCallback
     */
    obtenerMensaje: function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('mensajes');
                collection.find(criterio).toArray(function(err, mensajes) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(mensajes);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Función para insertar un mensaje en la base de datos.
     * @param mensaje el mensaje a insertar.
     * @param funcionCallback
     */
    insertarMensaje : function(mensaje, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('mensajes');
                collection.insert(mensaje, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Función para obtener los conversaciones según un criterio de la base de datos.
     * @param criterio el criterio para buscar los conversaciones
     * @param funcionCallback
     */
    obtenerConversaciones: function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('conversaciones');
                collection.find(criterio).toArray(function(err, conversaciones) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(conversaciones);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Función para insertar una conversación en la base de datos
     * @param chat la conversación a insertar
     * @param funcionCallback
     */
    insertarConversacion : function(chat, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('conversaciones');
                collection.insert(chat, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Función para modificar un usuario en la base de datos
     * @param criterio el criterio para buscar el usuario
     * @param usuario los datos modificados del usuario
     * @param funcionCallback
     */
    modificarUsuario : function(criterio, usuario, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('usuarios');
                collection.update(criterio, {$set: usuario}, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Función para modificar una oferta en la base de datos
     * @param criterio el criterio para buscar la oferta
     * @param oferta los datos modificados de la oferta
     * @param funcionCallback
     */
    modificarOferta : function(criterio, oferta, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('ofertas');
                collection.update(criterio, {$set: oferta}, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Función para obtener las ofertas de la base de datos encontradas en una página del sistema de paginación
     * @param criterio el criterio para encontrar las ofertas
     * @param pg la página de la que se quieren obtener las ofertas.
     * @param funcionCallback
     */
    obtenerOfertasPg : function(criterio,pg,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('ofertas');
                collection.count(function(err, count){
                    collection.find(criterio).skip( (pg-1)*5 ).limit( 5 )
                        .toArray(function(err, ofertas) {
                            if (err) {
                                funcionCallback(null);
                            } else {
                                funcionCallback(ofertas, count);
                            }
                            db.close();
                        });
                });
            }
        });
    },
    /**
     * Función para eliminar una oferta de la base de datos.
     * @param criterio el criterio para encontrar la oferta a eliminar.
     * @param funcionCallback
     */
    eliminarOferta : function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('ofertas');
                collection.remove(criterio, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Función para obtener las ofertas según un criterio de la base de datos.
     * @param criterio el criterio para buscar las ofertas
     * @param funcionCallback
     */
    obtenerOfertas: function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('ofertas');
                collection.find(criterio).toArray(function(err, ofertas) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(ofertas);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Función para insertar un oferta en la base de datos
     * @param oferta el oferta a insertar
     * @param funcionCallback
     */
    insertarOferta : function(oferta, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('ofertas');
                collection.insert(oferta, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Función para eliminar un usuario de la base de datos.
     * @param criterio el criterio para encontrar el usuario a eliminar.
     * @param funcionCallback
     */
    eliminarUsuario : function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('usuarios');
                collection.remove(criterio, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Función para obtener los usuarios según un criterio de la base de datos.
     * @param criterio el criterio para buscar los usuarios
     * @param funcionCallback
     */
    obtenerUsuarios : function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('usuarios');
                collection.find(criterio).toArray(function(err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(usuarios);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Función para insertar un usuario en la base de datos
     * @param usuario el usuario a insertar
     * @param funcionCallback
     */
    insertarUsuario : function(usuario, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('usuarios');
                collection.insert(usuario, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },

};