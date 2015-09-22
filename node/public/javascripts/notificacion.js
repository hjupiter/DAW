var PEDIDO = "notif-pedido";
var NUEVOMENSAJE = "notif-newmsg";
var CONFIRMACION = "notif-confirm";
var socket = io();



$(window).on('beforeunload', function(){
        console.log("close socket");
        socket.close();
    });

$(document).ready(function(){
    moment().locale('es');
    var name = document.getElementById("TempUsuario").value;
    console.log("emit" + name);
    socket.emit("inicioSesion",name);
    //var container = $('#containerMessages');
    //container.animate({"scrollTop": $('#containerMessages')[0].scrollHeight}, "slow");
});

var badge_num = 0;
function addBadge(){
   badge_num++;
   $("#notifica").attr("data-badge", badge_num);

}
function removeBadge(){
   badge_num = 0;
   $("#notifica").attr("data-badge", 0);

}
$(function(){
	$(".sendMsg").on("click", function(){
        var de = document.getElementById("TempUsuario").value;
        var para = document.getElementById("TempUsuario2").value;
        var mensaje = $("input#mensaje").val();
        console.log("+++++++++++++++++++");
        console.log("de: "+de);
        console.log("para: "+para);
        console.log("mensaje: "+mensaje);
        console.log("+++++++++++++++++++");
        

        var tipo = 1;
        var timeStamp = 0;
        console.log(para);
        console.log(mensaje);

        //evento menssaje ene l server nodejs
        socket.emit("enviarMensaje",de,para,mensaje);
        socket.emit("notificacion",de,para,mensaje,tipo,timeStamp)
        //socket.emit("notificacion",de,para,mensaje,tipo);
    });

    socket.on("notificar", function (action,message){
        //var not = document.getElementsBy("not").setAttribute("class","glyphicon glyphicon-info-sign");;
        //$("#not").attr("class","glyphicon glyphicon-info-sign");  
        //console.log(mensaje);
        //$("#chatMsgs").append("<p class='col-md-12 alert-info'>"+mensaje+"</p>");
        //not.setAttribute("class","glyphicon glyphicon-info-sign");
        //console.log("++++++++++++++++++");
        //alert("asdasdasdasd");

        if(action == "conectado")
        {
            $("#chatMsgs").append("<p class='col-md-12 alert-info'>" + message + "</p>");
        }
        //si es una desconexión
        else if(action == "desconectado")
        {
            $("#chatMsgs").append("<p class='col-md-12 alert-danger'>" + message + "</p>");
        }
        //si es un nuevo mensaje 
        else if(action == "msg")
        {
            $("#chatMsgs").append("<p class='col-md-12 alert-warning'>" + message + "</p>");
        }
        //si el que ha conectado soy yo
        else if(action == "yo")
        {
            $("#chatMsgs").append("<p class='col-md-12 alert-success'>" + message + "</p>");
        }

        var de = document.getElementById("TempUsuario").value;
        var para = document.getElementById("TempUsuario2").value;
        var mensaje = $("input#mensaje").val();
        var timeStamp = 0;
        var tipo = 1;
        console.log(de);
        console.log(para);
        console.log(mensaje);
        //socket.emit("notificacion",de,para,mensaje,tipo,timeStamp)
        //var container = $('#containerMessages');
        //container.animate({"scrollTop": $('#containerMessages')[0].scrollHeight}, "slow");
        //alert("gurdDO");
    });

	$("#notifica").on("click", function(){
            removeBadge();
        });

    /*
	$(".sendMsg").on("click", function(){
		var de = document.getElementById("perfilUsuario").innerHTML;
		var para = $("input#para").val();
		var mensaje = $("input#msg").val();
		var tipo = 1;
		var timeStamp = 0;
		console.log(para);
		console.log(mensaje);
		socket.emit("notificacion",de,para,mensaje,tipo,timeStamp);
	});
    */
	$(".sendNotificacion").on("click", function(){
		var de = document.getElementById("perfilUsuario").innerHTML;
		var para = $("input#para").val();
		var mensaje = $("input#msg").val();
		var tipo = 0;
		var timeStamp = 0;
		console.log(para);
		console.log(mensaje);
		socket.emit("notificacion",de,para,mensaje,tipo);
	});

	socket.on("notificarMensajePrivado", function (mensaje,nombre, tipo,de, timeStamp){
                console.log("nueva notificacion");
		var ul = document.getElementById("notificaExtension");
		var li = $(document.createElement('li'));
		var p = document.createElement("p");

		li.attr("class","mdl-menu__item ");
                var text;
                var timeText = '<span class="time-text">' + moment(timeStamp).fromNow()+ '</span>';

		if(tipo==1){//NUEVO MENSAJE
                        li[0].onclick = function(){ 
                            goToPage('/chatprivado/' + de);
                        };
			text = "<strong>" + nombre+"</strong>" +' te envio un mensaje.' + timeText;
			console.log(text);
		}
		if(tipo===0){//PETICION
                        li[0].onclick = function(){ 
                            goToPage('/driver');
                        };
                        text = "<strong>" +nombre+"</strong>" +" quiere que lo lleves." + timeText;
                        if(getPageType()=="car"){
                            var args = {timeStamp : timeStamp,
                                        username : de,
                                        nombre : nombre };
                            processFollowersNotifications([ args ]);
		        }
                }
		if(tipo===2){//CONFIRMACION
                        li[0].onclick = function(){ 
                            goToPage('/chatprivado/' + de);
                        };
			text = "<strong>" +nombre+"</strong>" +" te va a llevar." + timeText;
		}


		p.innerHTML = text;
		li.append(p);
		$("#notificaExtension").append(li);

                addBadge();

		/*
		//var not = document.getElementsBy("not").setAttribute("class","glyphicon glyphicon-info-sign");;
		$("#not").attr("class","glyphicon glyphicon-info-sign");  
		console.log(mensaje);
		$("#chat").append("<p class='col-md-12 alert-info'>"+mensaje+"</p>");
		//not.setAttribute("class","glyphicon glyphicon-info-sign");
		console.log("++++++++++++++++++");
		*/
	});
	
	socket.on('message',function(action, message){
		console.log(message);
        if(action == "conectado")
        {
            $("#chatMsgs").append("<p class='col-md-12 alert-info'>" + message + "</p>");
        }
        //si es una desconexión
        else if(action == "desconectado")
        {
            $("#chatMsgs").append("<p class='col-md-12 alert-danger'>" + message + "</p>");
        }
        //si es un nuevo mensaje 
        else if(action == "msg")
        {
            $("#chatMsgs").append("<p class='col-md-12 alert-warning'>" + message + "</p>");
        }
        //si el que ha conectado soy yo
        else if(action == "yo")
        {
            $("#chatMsgs").append("<p class='col-md-12 alert-success'>" + message + "</p>");
        }
        animateScroll();
    });
    
});
function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function goToPage(newUrl){
    console.log(window.location.href);
    if(!endsWith(window.location.href, newUrl))
        location.href = newUrl;
}


function miPerfil(){
    window.location.href = "/inicio";
}