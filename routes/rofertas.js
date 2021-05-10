module.exports = function(app, swig, gestorBD) {
    app.get('/oferta/eliminar/:id', function (req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.eliminarOferta(criterio,function(ofertas){
            if ( ofertas == null ){
                req.session.errores = {mensaje:"Error al eliminar el usuario.",tipoMensaje:"alert-danger"};

                res.redirect("/errors");
            } else {
                res.redirect("/oferta/lista");
            }
        });
    })

    app.get('/oferta/agregar', function (req, res){
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

    app.post('/oferta/agregar', function (req, res){

        let oferta = {
            title : req.body.title,
            description : req.body.description,
            price : req.body.price,
            seller : req.session.usuario,
            buyer : null,
            date : Date.now()
        }
        validaDatosAgregarOferta(oferta, function (errors){
            if (errors != null && errors.length > 0){
                req.session.errorAgregarOferta = errors;
                res.redirect('/oferta/agregar');
            }else {
                gestorBD.insertarOferta(oferta, function (id) {
                    if (id == null) {
                        req.session.errores = {mensaje:"Error al insertar el usuario",tipoMensaje:"alert-danger"};

                        res.redirect("/errors");
                    } else {
                        res.redirect('/oferta/lista');
                    }
                });
            }
        });


    });

    app.get('/oferta/lista', function (req, res){
        let criterio = {"seller" : req.session.usuario};
        gestorBD.obtenerOfertas(criterio, function (ofertas){
            if (ofertas == null){
                req.session.errores = {mensaje:"Error al cargar la lista de ofertas,",tipoMensaje:"alert-danger"};

                res.redirect("/errors");
            }else{
                let respuesta = swig.renderFile('views/blistaOfertas.html',
                    {
                        ofertas : ofertas,
                        usuario : req.session.usuario,
                        role : req.session.role,
                        money : req.session.money
                    });
                res.send(respuesta);
            }

        });
    });

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