module.exports = function(app, swig, gestorBD, logger) {

    /**
     * Petición para realizar la compra de una oferta. Una vez realizada la compra nos redigira a la vista donde se en-
     * -cueta la lista de compras del usuario.
     */
    app.get('/compra/comprar/:id', function (req, res){
        logger.info("Accediendo a la compra de una oferta");
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
                                    logger.info("Oferta Comprada");
                                    res.redirect("/compra/lista");
                                }
                            });
                        }
                    });
                }else{
                    logger.error("No tienes suficiente dinero para comprar esa oferta.");
                    req.session.errorPrecio = "No tienes suficiente dinero para comprar esa oferta.";
                    res.redirect("/compra/buscar");
                }
            }else{
                logger.error("El usuario es el vendedor o esa oferta ya ha sido comprada");
                req.session.errores = {mensaje:"El usuario es el vendedor o esa oferta ya ha sido comprada"
                    ,tipoMensaje:"alert-danger"};
                res.redirect("/errors");
            }
        });
    });

    /**
     * Función que comprueba si un usuario pasado por parámetro es el propetario de una oferta o ya ha comprado la oferta
     * @param usuario El usuario a conocer si es el vendedor o comprador
     * @param ofertaId El id de la oferta
     * @param funcionCallback
     */
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

    /**
     * Petición para get para mostrar la lista de compras que ha realizado un usuario.
     */
    app.get('/compra/lista', function (req, res){
        logger.info("Accediendo a la lista de compras");
        let criterio = {"buyer" : req.session.usuario};
        gestorBD.obtenerOfertas(criterio, function (compras){
            if (compras == null){
                logger.error("Error al cargar la lista de compras");
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

    /**
     * Petición get para obtener la lista en la que se encuentran las ofertas disponibles en la aplicación de otros usuarios
     * Esta vista cuenta con un sistema de búsqueda (no distigue minúsculas y mayúsculas) y un sistema de paginación en
     * la lista. Cada oferta cuenta con un enlace para realizar la compra.
     */
    app.get('/compra/buscar', function (req, res){
        logger.info("Accediendo a la lista de ofertas disponibles");
        let criterio = {};

        if( req.query.busqueda != null ){
            criterio = {$and: [{"title" :  {$regex : ".*"+req.query.busqueda+".*", $options : "$i"}}, {"seller" : {$ne : req.session.usuario}}]};
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
                logger.error("Error al listar la busqueda");
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
                        busqueda : req.query.busqueda,
                        error: req.session.errorPrecio
                    });
                req.session.errorPrecio = null;
                res.send(respuesta);
            }
        });
    });

    /**
     * Lista en la que se muestran las ofertas que han sido destacadas por los usuarios vendedores de la oferta. En cada
     * oferta se encuentra un enlace para acceder a la compra de dicha oferta.
     */
    app.get('/compra/destacada/lista', function (req, res){
        logger.info("Accediendo a la lista de ofertas destacadas");
        let criterio = {$and: [{"outstanding" : true}, {"seller" : {$ne : req.session.usuario}}]};


        gestorBD.obtenerOfertas(criterio, function(ofertas ) {
            if (ofertas == null) {
                logger.error("Error al listar las ofertas destacadas");
                req.session.errores = {mensaje:"Error al listar las ofertas destacadas",tipoMensaje:"alert-danger"};
                res.redirect("/errors");
            } else {

                let respuesta = swig.renderFile('views/blistaOfertasDestacadas.html',
                    {
                        usuario : req.session.usuario,
                        role : req.session.role,
                        money : req.session.money,
                        ofertas : ofertas,
                        error: req.session.errorPrecio
                    });
                req.session.errorPrecio = null;
                res.send(respuesta);
            }
        });
    });

}