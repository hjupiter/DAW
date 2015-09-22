var credentials     = require('./credentials');
var moment          = require('moment');
/** MongoDB Stuff */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rapidin');
var ObjectId = mongoose.Schema.Types.ObjectId;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('MongoDB connected');
  mongoose.set("debug", true);
});

var RouteSchema = new mongoose.Schema({
    userId : String,
    name : String,
    days : String,
    hour : Number,
    capacidad : Number,
    points : [{x : Number, y : Number}]
});

var ViajeSchema = new mongoose.Schema({
    routeId : ObjectId,
    time : String,
    pasajeros : Number,
    capacidad : Number,
});

var Route = mongoose.model('Route', RouteSchema);
var Viaje = mongoose.model('Viaje', ViajeSchema);
/** End MongoDB */

/** MariaSQL stuff */

var Client = require('mariasql');
var mariaClient = new Client();
mariaClient.connect({
     host: '127.0.0.1',
     user: credentials.getUser(),
     password: credentials.getPassword()
});

mariaClient.on('connect', function() {
  console.log('Client connected');
  })
  .on('error', function(err) {
  console.log('Client error: ' + err);
   })
  .on('close', function(hadError) {
  console.log('Client closed');
 });

var inspect = require('util').inspect;

/** End MariaSQL */
function executeQuery(queryString, object, callback){
    var queryResult = [];
        mariaClient.query(queryString, object)
                .on('result', function(res) {
                    res.on('row', function(row) {
                             console.log('Result row: ' + inspect(row));
                             queryResult.push(row);
                           })
                       .on('error', function(err) {
                                console.log('Result error: ' + inspect(err));
                           })
                          .on('end', function(info) {
                                   console.log('Result finished successfully');
                            });
                })
             .on('end', function endDBExecutionCallback() {
              console.log(queryResult);
                 callback(queryResult);
             });
    }

function isRouteClose(array, startX, startY, endX, endY){
    var tolerance = 0.02;
    var pointsMatched = 0;
    //console.log("new test");
    for(var i = 0; i < array.length; i++){
       if(pointsMatched === 0){
           if(Math.abs(startX - array[i].x) < tolerance && Math.abs(startY - array[i].y) < tolerance){
               pointsMatched = 1;
               //console.log("1");
           }
        } else if(pointsMatched == 1){
           if(Math.abs(endX - array[i].x) < tolerance && Math.abs(endY - array[i].y) < tolerance){
               pointsMatched = 2;
               //console.log("2");
           }
        }
    }
    return pointsMatched == 2;
}


module.exports = {

  user: function(nombre, apellido, username, placa, capacidad, bio, imagenRuta) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.username = username;
    this.placa = placa;
    this.capacidad = capacidad;
    this.bio = bio;
    this.imagenRuta = imagenRuta;
  },

  obtener_seguidor: function (usuario, callback) {
    var queryStr = 'call rapidin.obtener_seguidor()';
    executeQuery(queryStr, '', callback);
  },

   ruta: function(iduser, nombre, dias, hora) {
    this.iduser = iduser;
    this.nombre = nombre;
    this.dias = dias;
    this.hora = hora;
  },
    mensajeria: function(idUsuarioRemitente,idUsuarioRemisor,contenido,fecha,hora,ubicacionActual,tipo,leido){
      this.idUsuarioRemitente = idUsuarioRemitente;
      this.idUsuarioRemisor   = idUsuarioRemisor;
      this.contenido          = contenido;
      this.fecha              = fecha;
	  this.hora               = hora;
      this.ubicacionActual    = ubicacionActual;
      this.tipo               = tipo;
      this.leido              = leido;
  },
  crear_usuario: function (usuario, callback) {
    var queryStr = 'call rapidin.crear_usuario(:nombre, :apellido, :username, :placa, :capacidad, :bio, :imagenRuta)';
    var object = { nombre : usuario.nombre,
                apellido : usuario.apellido,
                username : usuario.username,
                placa : usuario.placa,
                capacidad : usuario.capacidad,
                bio : usuario.bio,
                imagenRuta : usuario.imagenRuta
    };
    executeQuery(queryStr, object, callback);
  },

  verificar_usuario: function (username, callback) {
      var queryStr = 'call rapidin.verificar_usuario(:username)';
      var object = {username : username};
      executeQuery(queryStr, object, callback);
   },

  obtener_usuario: function (usuario,callback){
      var queryStr = 'call rapidin.obtener_usuario(:username)';
      var object = {username : usuario};
      executeQuery(queryStr,object,callback);
   },

  update_usuario: function(usuario, callback){
    var queryStr = 'call rapidin.update_usuario(:nombre, :apellido, :username, :placa, :capacidadCarro,:bio)';
    var object = {
        nombre          : usuario.nombre,
        apellido        : usuario.apellido,
        username        : usuario.username,
        placa           : usuario.placa,
        capacidadCarro  : usuario.capacidad,
        bio             : usuario.bio
    };
    executeQuery(queryStr, object, callback);
   },

  insertar_ruta: function(idusuario, nombre, dias, hora, puntos, callback){
      module.exports.obtener_usuario(idusuario, function getUserCapacity(queryRes){
          var cap = queryRes[0].capacidadCarro;
            var newRoute  = new Route({
                        userId    : idusuario,
                        name      : nombre,
                        days      : dias,
                        hour      : hora,
                        capacidad : cap,
                        points : puntos });
           newRoute.save(function saveRouteMongo(err, newRoute){
               if(err){
                   console.log("Error  al guardar con mongoose");
                   return console.error(err);
               } else {
                   console.log("stored " + newRoute);
               }
           });
   });
  },

  insertar_viaje: function(route, tiempo, cap){
    var newTrip  = new Viaje({
                routeId     : route,
                time        : tiempo,
                pasajeros   : 0,
                capacidad   : cap });
   newTrip.save(function savetripMongo(err, newTrip){
       if(err){
           console.log("Error  al guardar viaje con mongoose");
           return console.error(err);
       }
   });
  },

  getMisRutas : function(username, callback){
    var query = Route.find({ userId : username  });
    query.exec(function mongoDBExec(err, myRoute){
        if(err)
            console.error(err);
        else{
            callback(myRoute);
        }

    });
  },

  getRutasCerca : function(day, time, startX, startY, endX, endY, callback){
    time = parseInt(time);
    startX = parseFloat(startX);
    startY = parseFloat(startY);
    endX = parseFloat(endX);
    endY = parseFloat(endY);
    var upperLimit = time + 120;
    var query = Route.find({ "days" : {  "$regex" : day, "$options" : "i"  },
                             "hour" : {  "$gt" : time, "$lt" : upperLimit} });
    query.exec(function mongoDBExec(err, todaysRoutes){
        if(err)
            console.error(err);
        else{
            var closeRoutes = [];
            console.log("searching in " + todaysRoutes.length + " routes");
            for(var i = 0; i < todaysRoutes.length; i++){
               if(isRouteClose(todaysRoutes[i].points, startX, startY, endX, endY))
                   closeRoutes.push(todaysRoutes[i]);
            }
            if(closeRoutes.length > 0)
                module.exports.getViajesCerca(closeRoutes, callback);
            else
                callback([]); 
        }


    });
  },

  getViajesCerca : function(rutas, callback){
        var id_list = [];
        var rutas_map = [];
        var viajes_map = [];
        var resultado = [];
        var i;
        var currentDate = moment(Date.now()).format('DD-MM-YYYY');
        console.log("getRutasCerca: " + rutas.length);
        for(i=0 ; i < rutas.length; i++ ){
            if(rutas[i]){
                id_list.push({ routeId : rutas[i]._id});
                rutas_map[rutas[i]._id] = rutas[i];
            }
        }
        var query = Viaje.find();
        query.or(id_list);
        query.where('time').equals(currentDate);
        query.exec(function viajesCercaQuery(err, docs){
            console.log("err: "  + err);
            console.log("docs: " + docs.length);
            for(i = 0; i < docs.length; i++ ){
                var viaje = docs[i];
                viajes_map[viaje.routeId] = viaje;
            }
            for(i = 0; i < rutas.length; i++){
                var id = rutas[i];
                var trip = viajes_map[id._id];
                var route = rutas_map[id._id];
                var routeRes;
                if(trip){
                    if(trip.pasajeros < trip.capacidad){
                        console.log("trip existe");
                        routeRes = route.toObject();
                        routeRes.asientos = trip.capacidad - trip.pasajeros;
                        resultado.push(routeRes);
                    }
                } else {
                    console.log("trip no existe");
                    routeRes = route.toObject();
                    routeRes.asientos = route.capacidad;
                    module.exports.insertar_viaje(route._id, currentDate, route.capacidad);
                    resultado.push(routeRes);
                }
            }
            callback(resultado);
        });
    },

 enviar_mensaje: function(mensajeria,callback){
       var queryStr = 'call rapidin.enviar_mensaje(:idUsuarioRemitente, :idUsuarioRemisor, :contenido, :fecha, :hora, :ubicacionActual, :tipo, :leido)';
       var object = {
               idUsuarioRemitente : mensajeria.idUsuarioRemitente,
               idUsuarioRemisor   : mensajeria.idUsuarioRemisor,
               contenido          : mensajeria.contenido,
               fecha              : mensajeria.fecha,
			   hora               : mensajeria.hora,
               ubicacionActual    : mensajeria.ubicacionActual,
               tipo               : mensajeria.tipo,
               leido              : mensajeria.leido
               };
       executeQuery(queryStr, object, callback);
     },

 notificar_mensaje: function(mensajeria,callback){
       var queryStr = 'call rapidin.enviar_mensaje(:idUsuarioRemitente, :idUsuarioRemisor, :contenido, :fecha, :ubicacionActual, :tipo, :leido)';
       var object = {
               idUsuarioRemitente : mensajeria.idUsuarioRemitente,
               idUsuarioRemisor   : mensajeria.idUsuarioRemisor,
               contenido          : mensajeria.contenido,
               fecha              : mensajeria.fecha,
               ubicacionActual    : mensajeria.ubicacionActual,
               tipo               : mensajeria.tipo,
               leido              : mensajeria.leido
               };
       executeQuery(queryStr, object, callback);
     },

  obtener_seguidor: function (username, callback) {
    var queryStr = 'call rapidin.obtener_seguidor(:username)';
    var object={
      username: username
    };
    executeQuery(queryStr,object, callback);
  },

  obtener_siguiendo: function (username, callback) {
    var queryStr = 'call rapidin.obtener_siguiendo(:username)';
    var object={
      username: username
    };
    executeQuery(queryStr,object, callback);
  },

  agregar_seguidor: function (username,nombre, callback) {
    var queryStr = 'call rapidin.agregar_seguidor(:siguiendo, :seguidor)';
    var object={
      siguiendo: nombre,
      seguidor: username
    };
    executeQuery(queryStr, object, callback);
  },
  
  obtener_lista_seguidores: function(usuario,callback){
    queryStr = 'call rapidin.obtener_lista_seguidores(:username)';
    var object = {username : usuario.username};
    executeQuery(queryStr,object,callback);
  },
  obtener_usuarios: function(callback){
    queryStr = 'call rapidin.obtener_usuarios()';
    var object = null;
    executeQuery(queryStr,object,callback);
  },
  guardar_imagen_ruta: function (usuario, callback){
    var queryStr = 'call rapidin.guardar_imagen_ruta(:username)';
    var object = {username: usuario.username};
    executeQuery(queryStr,object,callback);
  },

  obtener_mensajes: function (callback){
    var queryStr = 'call rapidin.obtener_mensajes()';
    var object = null;
    executeQuery(queryStr,object,callback);
  },

  update_usuario_imagen: function(tipo,username,callback){
    var queryStr = 'call rapidin.update_usuario_img(:tipo, :username)';
    var object = {tipo: tipo, username: username};
    executeQuery(queryStr,object,callback);
  }
};
