var credentials     = require('./credentials');

/** MongoDB Stuff */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rapidin');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('MongoDB connected');
});

var RouteSchema = new mongoose.Schema({
    userId : String,
    name : String,
    days : String,
    hour : Number,
    points : [{x : Number, y : Number}]
});

var Route = mongoose.model('Route', RouteSchema);

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
    var tolerance = 0.003;
    var pointsMatched = 0;
    for(var i = 0; i < array.length; i++){
       if(pointsMatched === 0){
           if(Math.abs(startX - array[i].x) < tolerance && Math.abs(startY - array[i].y) < tolerance){
               pointsMatched = 1;
           }
        } else if(pointsMatched == 1){
           if(Math.abs(endX - array[i].x) < tolerance && Math.abs(endY - array[i].y) < tolerance){
               pointsMatched = 2;
           }
        }
    }
    return pointsMatched == 2;
}


module.exports = {
 
  user: function(nombre, apellido, username, placa, capacidad, bio) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.username = username;
    this.placa = placa;
    this.capacidad = capacidad;
    this.bio = bio;    
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
    mensajeria: function(idUsuarioRemitente,idUsuarioRemisor,contenido,fecha,ubicacionActual,tipo,leido){
      this.idUsuarioRemitente = idUsuarioRemitente;
      this.idUsuarioRemisor   = idUsuarioRemisor;
      this.contenido          = contenido;
      this.fecha              = fecha;
      this.ubicacionActual    = ubicacionActual;
      this.tipo               = tipo;
      this.leido              = leido;
  },
  crear_usuario: function (usuario, callback) {
    var queryStr = 'call rapidin.crear_usuario(:nombre, :apellido, :username, :placa, :capacidad, :bio)';
    var object = { nombre : usuario.nombre,
                apellido : usuario.apellido,
                username : usuario.username,
                placa : usuario.placa,
                capacidad : usuario.capacidad,
                bio : usuario.bio
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
      var object = {username : usuario.username};
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
    var newRoute  = new Route({
                userId : idusuario,
                name   : nombre,
                days   : dias,
                hour   : hora,
                points : puntos });    
   newRoute.save(function saveRouteMongo(err, newRoute){
       if(err){
           console.log("Error  al guardar con mongoose");
           return console.error(err);
       } else {
           console.log("stored " + newRoute);
       }
   });
  },

  getMisRutas : function(username, callback){
    var query = Route.find({ userId : username  });
    query.select('userId name days hour points');
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
    query.select('userId name days hour points');
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
            callback(closeRoutes);
        }


    });
  },

 enviar_mensaje: function(mensajeria,callback){
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
  obtener_lista_seguidores: function(usuario,callback){
    queryStr = 'call rapidin.obtener_lista_seguidores(:username)';
    var object = {username : usuario.username};
    executeQuery(queryStr,object,callback);
  },
  obtener_usuarios: function(callback){
    queryStr = 'call rapidin.obtener_usuarios()';
    var object = null;
    executeQuery(queryStr,object,callback);
  }
};



