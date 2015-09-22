var map;
var waypts = [];
var locations = [];
var markers = [];
var whitespace = "NbSp1";
var start;
var end;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var agregandoData = false;
var message;
var blinkHandler = null;
var currentPosition = null;
/*
function addDefaultRoutes(){
		myRoutes["Home"] = [new google.maps.LatLng(-2.1445351790, -79.96751056), new google.maps.LatLng(-2.140574, -79.864637)];
		myRoutes["Trabajo"] = [new google.maps.LatLng(-2.1445351790, -79.96751056), new google.maps.LatLng(-2.160446, -79.899795)];
}*/
function initializeMap(){
    console.log("init map");
    directionsDisplay = new google.maps.DirectionsRenderer();
    navigator.geolocation.getCurrentPosition(function (position) {

	currentPosition = new google.maps.LatLng(position.coords.latitude,
        position.coords.longitude);
        console.log(currentPosition);
	 			//Opciones del mapa
				var mapOptions = {
	    			zoom: 17,
	    			center: currentPosition
				};

        //Muestra el mapa
				map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
				directionsDisplay.setMap(map);
 				//Agrega un manejador del evento click sobre el mapa
				//google.maps.event.addListener(map, 'click', addLatLng);
				//navigator.geolocation.getCurrentPosition(marksFromCurrentPos);
                                loadData();
	});	   
}

function replaceWhitespace(name){
    return name.replace(' ', whitespace);
}


function isValidAlphaNumericName(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58 && i > 0) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
}

function finishNewRoute(){
	//google.maps.event.clearListeners(map, 'click');
        if(blinkHandler){
            console.log("finish");
            window.clearInterval(blinkHandler);
        }
        placeForm();

	/**$('#pickRoute').fadeOut(function(){
            console.log("invinsible out");
		$('#pickRoute').toggleClass("invisible");
        });*/

}

function escogerInicio(){
	agregandoData = true;
        $("#pickRoute").attr("style", "");
	$("#pickRoute").toggleClass("invisible");
        blinkHandler = setInterval(blinker, 1600);
}
function removeForm(){
    $("#newRouteForm").toggleClass("invisible");
    $("#rutasUL").toggleClass("invisible");
}	
function placeForm(){
    $("#rutasUL").toggleClass("invisible");
    $("#newRouteForm").toggleClass("invisible");
    }
function blinker() {
    $('.blink_me').fadeOut(800);
    $('.blink_me').fadeIn(800);
    console.log("blink");
}



function returnWhitespace(name){
		return name.replace(whitespace, " ");
}

function printObjProperties(object){
    var propValue;
        for(var propName in object) {
            propValue = object[propName];
            console.log(propName,propValue);
        }
}

function addLocation(lat, lng){
    locations.push({ x : lat,
                    y : lng});
}
        

function addLatLng(event){
    //Agrega un nuevo marcador en el mapa
		//
   var x = event.latLng.lat();
   var y = event.latLng.lng();
    console.log("clicked :" + event.latLng.lat()+ " " +  event.latLng.lng());
    var marker = new google.maps.Marker({
    		position: event.latLng,
				title: '#',
				draggable:true,
				map: map
    });

    if(start === null){
        start = marker;
        locations = [];
        pickRoute.innerHTML = "Selecciona el destino de la nueva ruta";
        addLocation(x,y);
				return;
    }
    else if (end === null){
        end = marker;
        pickRoute.innerHTML = "Agrega puntos intermedios donde puedas recoger/dejar pasajeros";
        //addLocation(x,y);
        finishNewRoute();
    }
    else {//Add waypoints
        var point = {
            location : marker.position,
            stopover : false
        };
	waypts.push(point);
        addLocation(x,y);
        console.log(JSON.stringify(locations));
    }

    var request = {
	origin: start.position,
	destination: end.position,
	waypoints: waypts,
	optimizeWaypoints: true,
	travelMode: google.maps.TravelMode.DRIVING
    };

		directionsService.route(request, function (response, status) {
        if(status == google.maps.DirectionsStatus.OK){
            directionsDisplay.setDirections(response);
				}
		});


    
}

function clickToGo(event){
    clearRuta();
    //Agrega un nuevo marcador en el mapa
		//
   var x = event.latLng.lat();
   var y = event.latLng.lng();
    console.log("clicked :" + event.latLng.lat()+ " " +  event.latLng.lng());
    var marker = new google.maps.Marker({
    		position: event.latLng,
				title: '#',
				draggable:true,
				map: map
    });

    start = new google.maps.Marker({
        position: currentPosition,
        title: '#',
        draggable:true,
        map: map
    });

    end = marker;
    var request = {
	origin: start.position,
	destination: end.position,
	waypoints: waypts,
	optimizeWaypoints: true,
	travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function (response, status) {
        if(status == google.maps.DirectionsStatus.OK){
            directionsDisplay.setDirections(response);
				}
		});
    getFollowingsNotifications(start.position.lat(), start.position.lng(),
                end.position.lat(), end.position.lng());

}

function clearRuta(){
    if(start)
        start.setMap(null);
    if(end)
        end.setMap(null);
    for(var i = 0; i < markers.length; i++){
        if(markers[i])
            markers[i].setMap(null);
    }
    console.log("routes cleared");
    start = null;
    end = null;
    waypts = [];
    markers = [];
}

function addRouteMarkers(points){
    //Agrega un nuevo marcador en el mapa
		//
    for (var i = 0; i < points.length; i++){
        var pos = new google.maps.LatLng(points[i].x, points[i].y);
        var myMarker = new google.maps.Marker({
    		position: pos,
	        title: '#',
	        draggable:true,
	        map: map
    });
        if(i === 0){
            start = myMarker;
            waypts = [];
        }else if( i == points.length - 1)
            end = myMarker;
        else{
            var point = {
                location : pos,
                stopover : false
            };
            markers.push(myMarker);
            waypts.push(point);
        }
    }
    
    var request = {
        origin: start.position,
        destination: end.position,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function (response, status) {
        if(status == google.maps.DirectionsStatus.OK){
            console.log("directions OK");
            directionsDisplay.setDirections(response);
        }
    });

}




function nombrarRuta(){
	console.log("nombrarRuta");
	var form = document.createElement("form");
	form.setAttribute("class", "navbar-form navbar-left bar-item");
	form.setAttribute("role", "search");
	form.setAttribute("onsubmit", "return false"); //Estupido hack para que no se reinice la ventana
	var div = document.createElement("div");	
	div.setAttribute("class", "input-group");
	var input = document.createElement("input");	
	input.setAttribute("type", "text");
	input.setAttribute("class", "form-control");
	input.setAttribute("id", "formName");
	input.setAttribute("placeholder", "Nombre para esta ruta");
	var button = document.createElement("button");
	button.setAttribute("class", "btn btn-default");
	button.setAttribute("type", "submit");
	button.setAttribute("id", "submitName");
	button.innerHTML = "Guardar";
	div.appendChild(input);
	form.appendChild(div);
	form.appendChild(button);
	$("#navbar-left").append(form);


}



function showRuta(points){
    var routepts = JSON.parse(points);
    addRouteMarkers(routepts);
}

function showDestino(name){
    var pos = myDest[name];
    if(pos !== null)
        addRouteMarkers(currentPosition, pos);
}

function abortNewRoute(){
    $('#pickRoute').addClass('invisible');
    agregandoData = false;
}



//JQuery Events
$(document).ready( function(){
        //Guardar la nueva ruta
        $("body").on('click', '#submitRoute', function(){
                submitContent();
        });
        $("body").on('click', '#nuevaDataPopup', function(){
            console.log('nuevadata');
            nuevaMapData();
        });
        $("body").on('click', '.takeMe', function(){
            console.log('takeMe');
	    var de = $("#TempUsuario").val();
            console.log("de: " + de);
            console.log("para: " + $(this).attr("data-user"));
            socket.emit("notificacion", de, $(this).attr("data-user"), "", 0);
        });

        $("body").on('click', '.llevarBtn', function(){
            console.log('llevar');
	    var de = $("#TempUsuario").val();
            console.log("de: " + de);
            console.log("para: " + $(this).attr("data-user"));
            socket.emit("notificacion", de, $(this).attr("data-user"), "", 2);
        });

        $("body").on('click', '.ignoreBtn', function(){
            console.log('ignore');
            $(this).parent().remove();
        });

        //Mostrar gente cerca cuando das click a una ruta
	$("body").on('click', 'li.misRutas', function(){                
                abortNewRoute();
                clearRuta();
		clearFollowersNotification();
                if(getPageType() == "car"){
		    showRuta($(this).attr('data-pts'));
                    //getFollowersNotifications();
                }else{
		    showDestino(replaceWhitespace($(this).attr('data-name')));
                    getFollowingsNotifications(start.position.lat(), start.position.lng(), end.position.lat(), end.position.lng());
		}$('li.misRutas').removeClass("active");
		$(this).toggleClass("active");
	});

        $("body").on('click', '.followingRoute', function(){                
            abortNewRoute();
            clearRuta();
	    showRuta($(this).attr('data-pts'));
	});
        //Mostrar el popup de followers cuando das click en el boton
        /**
	$('#followers-btn').click(function(){
		console.log("click");
		$('#myModal_siguiendo').modal('show');
	});

	$('#myModal_siguiendo').modal({ show: false});
        */

});


google.maps.event.addDomListener(window, 'load', initializeMap);

