use rapidin ;

drop procedure if exists crear_usuario;
DELIMITER $$
create procedure crear_usuario(nombre VARCHAR(45), apellido VARCHAR(45), usuario VARCHAR(20), placa VARCHAR(8), capacidad INT, bio VARCHAR(140),imagenRuta VARCHAR(100))
begin
    insert into usuario (nombre,apellido,usuario,placa,capacidadCarro,bio,imagenRuta) values(nombre, apellido, usuario, placa, capacidad,bio,imagenRuta);
END;
$$
DELIMITER ;

drop procedure if exists obtener_usuario;
DELIMITER $$
CREATE PROCEDURE obtener_usuario(username VARCHAR(20))
begin
    select usuario,nombre,apellido,placa,capacidadCarro,bio,imagenRuta from usuario where usuario=usuario and usuario = username;
end;
$$
DELIMITER ;

drop procedure if exists verificar_usuario;
DELIMITER $$
CREATE PROCEDURE verificar_usuario(username VARCHAR(20))
begin
	if ((select count(*) from usuario where usuario = username)>0) then
		select true;
	else
		select false;
	end if;
end;
$$
DELIMITER ;


drop procedure if exists update_usuario;
DELIMITER $$
create procedure update_usuario(nombre VARCHAR(45),apellido VARCHAR(45),username VARCHAR(20),placa VARCHAR(10),capacidad INT,bio VARCHAR(140))
begin
	update usuario set nombre=nombre ,apellido=apellido ,placa=placa ,capacidadCarro=capacidad ,bio=bio where usuario=username;
END;
$$
DELIMITER ;

drop procedure if exists insertar_ruta;
DELIMITER $$
create procedure insertar_ruta(idUsuario VARCHAR(20),nombre VARCHAR(45),dias VARCHAR(14),hora SMALLINT)
begin
	insert into ruta (idUsuario,nombre,dias,hora) values(idUsuario,nombre,dias,hora);
END;
$$
DELIMITER ;

drop procedure if exists enviar_mensaje;
DELIMITER $$
create procedure enviar_mensaje(idUsuarioRemitente VARCHAR(20),
							    idUsuarioRemisor VARCHAR(20),
							    contenido VARCHAR(280),
							    fecha date,
							    hora BIGINT,
							    ubicacionActual VARCHAR(45),
							    tipo INT,
							    leido INT)
begin
	insert into mensaje(idUsuarioRemitente,idUsuarioRemisor,contenido,fecha,hora,ubicacionActual,tipo,leido) values(idUsuarioRemitente,idUsuarioRemisor,contenido,fecha,hora,ubicacionActual,tipo,leido);
END;
$$
DELIMITER ;

drop procedure if exists notificar_mensaje;
DELIMITER $$
create procedure notificar_mensaje(idUsuarioRemitente VARCHAR(20))
begin
	select count(tipo) from mensaje where idUsuarioRemitente = idUsuarioRemitente and leido = 0;
END;
$$
DELIMITER ;

drop procedure if exists guardar_imagen_ruta;
DELIMITER $$
create procedure guardar_imagen_ruta(username VARCHAR(20))
begin
	update usuario set usuario.imagenRuta='null' where usuario=username;
END;
$$
DELIMITER ;

drop procedure if exists agregar_seguidor;
DELIMITER $$
CREATE PROCEDURE agregar_seguidor(seguidor VARCHAR(20), siguiendo VARCHAR(20))
begin                            
 if((select count(*) from usuario where usuario  = seguidor)>0 AND 
 (select count(*) from usuario where usuario  = siguiendo)>0)then
    INSERT INTO rapidin.seguidores_siguiendo(idSeguidorSiguiente,idUsuario1Siguiendo,idUsuario2Seguidor)
	VALUES(null,siguiendo,seguidor);
 else 
	select false; 
 end if; 
 end;
 $$
DELIMITER ;

drop procedure if exists obtener_seguidor;
DELIMITER $$
CREATE PROCEDURE obtener_seguidor(usu varchar(20))
begin
    SELECT nombre,apellido,usuario,placa,capacidadCarro,bio
	FROM   rapidin.usuario
    LEFT OUTER JOIN rapidin.seguidores_siguiendo
    ON usuario.usuario = seguidores_siguiendo.idUsuario1Siguiendo
    WHERE usuario.usuario not in (
	select idUsuario1Siguiendo from seguidores_siguiendo
    where idUsuario2Seguidor=usu);
END;
$$
DELIMITER ;

drop procedure if exists obtener_siguiendo;
DELIMITER $$
CREATE PROCEDURE obtener_siguiendo(usu varchar(20))
BEGIN
	select nombre,apellido,usuario,placa,capacidadCarro,bio
	from usuario ,seguidores_siguiendo 
	where usuario.usuario=seguidores_siguiendo.idUsuario1Siguiendo and idUsuario2Seguidor=usu;
END;
$$
DELIMITER ;

drop procedure if exists obtener_lista_seguidores;
DELIMITER $$
create procedure obtener_lista_seguidores(username VARCHAR(20))
begin
        select DISTINCT seguidores_siguiendo.idUsuario2Seguidor
        from usuario join seguidores_siguiendo
        where usuario.usuario = seguidores_siguiendo.idUsuario1Siguiendo and usuario.usuario = username;
END;
$$
DELIMITER ;

drop procedure if exists obtener_usuarios;
DELIMITER $$
create procedure obtener_usuarios()
begin
        select usuario.usuario,usuario.nombre,usuario.apellido,usuario.placa,usuario.capacidadCarro,usuario.bio
        from usuario;
END;
$$
DELIMITER ;

drop procedure if exists obtener_mensajes;
DELIMITER $$
create procedure obtener_mensajes()
begin
        select mensaje.idUsuarioRemitente, mensaje.idUsuarioRemisor, mensaje.contenido, mensaje.tipo
        from mensaje;
END;
$$
DELIMITER ;

drop procedure if exists update_usuario_img;
DELIMITER $$
create procedure update_usuario_img(tipo int, username varchar(20))
begin
	UPDATE usuario SET imagenRuta = tipo WHERE usuario = username;
END;
$$
DELIMITER ;