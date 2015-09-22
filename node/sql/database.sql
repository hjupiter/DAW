create database rapidin;
use rapidin;

create table usuario(
nombre varchar(45) ,
apellido varchar(45),
usuario varchar(20) ,
placa varchar(8),
capacidadCarro int,
bio varchar(140),
imagenRuta varchar(100),
PRIMARY KEY (usuario)
);

create table destino(
idDestino INT not null AUTO_INCREMENT,
idUsuario varchar(20),
nombreDestino varchar(45),
destinoPosX DOUBLE(16,10),
destinoPosY DOUBLE(16,10),
PRIMARY KEY(idDestino),
foreign key (idUsuario) references usuario(usuario)
);

create table seguidores_siguiendo(
idSeguidorSiguiente INT not null AUTO_INCREMENT,
idUsuario1Siguiendo varchar(20),
idUsuario2Seguidor varchar(20),
PRIMARY KEY(idSeguidorSiguiente),
foreign key(idUsuario1Siguiendo) references usuario(usuario),
foreign key(idUsuario2Seguidor ) references usuario(usuario)
);

create table mensaje(
idMensaje INT not null AUTO_INCREMENT,
idUsuarioRemitente varchar(20),
idUsuarioRemisor varchar(20),
contenido varchar(280),
fecha date,
hora int,
ubicacionActual varchar(45),
tipo int,
leido int,
PRIMARY KEY(idMensaje)
);

create table viaje(
idViaje INT not null AUTO_INCREMENT,
idUsuario varchar(20),
idRuta INT not null,
fecha varchar(10),
PRIMARY KEY(idViaje),
foreign key(idUsuario) references usuario(usuario)
);

create table pasajero(
idPasajero INT not null AUTO_INCREMENT,
idUsuario varchar(20) ,
idViaje INT not null ,
PRIMARY KEY(idPasajero),
foreign key(idViaje) references viaje(idViaje),
foreign key(idUsuario) references usuario(usuario)
);
