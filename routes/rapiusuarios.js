module.exports = function (app, gestorBD){

    app.post('/api/identificarse/', function (req, res){
            let seguro = app.get ("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');

            let criterio = {
                email: req.body.email,
                password : seguro
            }
    });
}