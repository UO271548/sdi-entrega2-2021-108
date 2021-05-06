module.exports = function(app, swig, gestorBD) {

    app.get('/compra/comprar/:id', function (req, res){
        let ofertaId = gestorBD.mongo.ObjectID(req.params.id);
        let usuario = req.session.usuario;


        noVendedorYnoComprador(usuario, ofertaId, function (puedeComprar, precioCompra){
            if(puedeComprar ){
                if (req.session.money >= precioCompra) {
                    let compra = {
                        buyer: usuario,
                    }
                    let criterio = {"_id": ofertaId};
                    gestorBD.modificarOferta(criterio, compra, function (idCompra) {
                        if (idCompra == null) {
                            res.send(respuesta);
                        } else {
                            let criterio = {"email": usuario}
                            let money = req.session.money - precioCompra;
                            req.session.money = money;
                            let usuarioNuevo = {"money": money};
                            gestorBD.modificarUsuario(criterio, usuarioNuevo, function (idUsuario) {
                                if (idUsuario == null) {
                                    res.send(respuesta);
                                } else {
                                    res.redirect("/compra/lista");
                                }
                            });
                        }
                    });
                }else{
                    req.session.errorPrecio = "No tienes suficiente dinero para comprar esa oferta.";
                    res.redirect("/compra/buscar");
                }
            }else{
                req.session.errores = {mensaje:"El usuario es el vendedor o esa oferta ya ha sido comprada"
                    ,tipoMensaje:"alert-danger"};
                res.redirect("/errors");
            }
        });
    });

    function noVendedorYnoComprador (usuario,ofertaId, funcionCallback){
        let criterio = {$and: [{"_id" : ofertaId}, {"seller": usuario}]};
        gestorBD.obtenerOfertas(criterio,function (ofertas){
            if (ofertas.length > 0 || ofertas == null) {
                funcionCallback(false);
            }else {
                let criterio = {$and: [{"_id" : ofertaId}, {"buyer": null}]};
                gestorBD.obtenerOfertas(criterio,function (compras) {
                    if (compras.length > 0 || compras == null){
                        funcionCallback(true,compras[0].price);
                    }else{
                        funcionCallback(false);
                    }
                });
            }

        });
    };

    app.get('/compra/lista', function (req, res){
        let criterio = {"buyer" : req.session.usuario};
        gestorBD.obtenerOfertas(criterio, function (compras){
            if (compras == null){
                req.session.errores = {mensaje:"Error al cargar la lista de compras",tipoMensaje:"alert-danger"};

                res.redirect("/errors");
            }else{
                let respuesta = swig.renderFile('views/blistaCompras.html',
                    {
                        compras : compras,
                        usuario : req.session.usuario,
                        role : req.session.role,
                        money : req.session.money
                    });
                res.send(respuesta);
            }

        });
    });

    app.get('/compra/buscar', function (req, res){
        let criterio = {};

        if( req.query.busqueda != null ){
            criterio = {$and: [{"title" :  {$regex : ".*"+req.query.busqueda+".*"}}, {"seller" : {$ne : req.session.usuario}}]};
        }
        else{
             criterio = {"seller" : { $ne : req.session.usuario}};
        }

        let pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerOfertasPg(criterio, pg , function(ofertas, total ) {
            if (ofertas == null) {
                req.session.errores = {mensaje:"Error al listar la busqueda",tipoMensaje:"alert-danger"};
                res.redirect("/errors");
            } else {
                let ultimaPg = total/4;
                if (total % 4 > 0 ){ // Sobran decimales
                    ultimaPg = ultimaPg+1;
                }
                let paginas = []; // paginas mostrar
                for(let i = pg-2 ; i <= pg+2 ; i++){
                    if ( i > 0 && i <= ultimaPg){
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/bbusquedaOfertas.html',
                    {
                        usuario : req.session.usuario,
                        role : req.session.role,
                        money : req.session.money,
                        ofertas : ofertas,
                        paginas : paginas,
                        actual : pg,
                        error: req.session.errorPrecio
                    });
                req.session.errorPrecio = null;
                res.send(respuesta);
            }
        });
    });

}