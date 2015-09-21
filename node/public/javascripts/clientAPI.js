var myRoutes = [];
var myDest = [];
function handleJSON(url, callback){
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		//console.log("ready " + xmlhttp.status);
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        //console.log(xmlhttp.responseText);
    	var myArr = JSON.parse(xmlhttp.responseText);
//			console.log("200");
    	callback(myArr);
  	}
	};
  xmlhttp.overrideMimeType("application/json");
	xmlhttp.open("GET", url, true);
	xmlhttp.send(null);
}

function processFollowersNotifications(jArray){
	var i;
	var start = '<div class="near-container"><span class="time-text">' ;
        var preLink = '</span><strong><a href="/inicio/';
        var preName = '" target="_blank">';
        var preButtons = '</a></strong><br><button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent notif-button llevarBtn" data-user="';
        var preIgnore = '">Llevar</button><button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent notif-button ignoreBtn" data-user="';
        var end = '">Ignorar</button><hr></div>';
	var out = "";
	for (i=0; i<jArray.length; i++){
	    out += start + moment(jArray[i].timeStamp).fromNow() + preLink  + jArray[i].username + preName +  jArray[i].nombre + preButtons + jArray[i].username  + preIgnore + jArray[i].username+ end;
	}
	console.log(out);
	document.getElementById('active-follower-list').innerHTML += out;
}

function processFollowingsNotifications(jArray){
        jArray = jArray.array;
        console.log(JSON.stringify(jArray));
	var i;
	var start = '<div class="near-container"><span class="time-text">' ;
        var mid1 = '</span><dt>';
        var preCap = '</dt><dd>';
	var prelink = 'disponibles</dd><strong>Conductor: </strong><a target="_blank" href="/inicio/';
        var preUsername = '">';
        var preUser = '</a><div><button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent notif-button takeMe"  data-user="';
        var preRuta = '">Llevame</button><button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent notif-button followingRoute" data-pts=\'';

        var end = '\'>Ver Ruta</button></div><hr></div>';
	var out = "";
	for (i=0; i<jArray.length; i++){
            var asientos = jArray[i].asientos !== 1 ? '&nbspasientos&nbsp' : '&nbspasiento&nbsp';
	    out += start + moment().startOf('day').add(jArray[i].hour, 'minutes').fromNow() + mid1 + jArray[i].name + preCap  + jArray[i].asientos  + asientos + prelink +jArray[i].userId + preUsername + jArray[i].userId +  preUser + jArray[i].userId + preRuta + JSON.stringify(jArray[i].points) + end;
	}
        //console.log("notification: " + out);
        if(out.length > 0)
	    document.getElementById('active-follower-list').innerHTML = out;
        else
	    document.getElementById('active-follower-list').innerHTML = '<p id="emptyNotif">No hay datos.<br>Selecciona un destino.</p>';
}
function getDias(binary){
	var out = "";
        if(binary === "1,2,3,4,5,6,7")
		return "Todos";
	else if(binary === "1,2,3,4,5")
		return "Lunes a Viernes";
	else{
		if(binary.contains('1'))
			out += "Lunes, ";
		if(binary.contains('2'))
			out += "Martes, ";		
		if(binary.contains('3'))
			out += "Miercoles, ";
		if(binary.contains('4'))
			out += "Jueves, ";
		if(binary.contains('5'))
			out += "Viernes, ";
		if(binary.contains('6'))
			out += "Sabado, ";
		if(binary.contains('7'))
			out += "Domingo, ";
		var result =  out.substring(0, out.length-2);
                var index = result.lastIndexOf(',');
                return result.substring(0,index) + ' y' + result.substring(index+1);
	}
	return null;
}

function getHourString(num){
    return moment().startOf('day').add(num, 'minutes').format("hh:mm");
}

function processMyDestinations(jArray){
	var i;
	var start = '<li class="misRutas" data-name="';
	var preName = '"><a href="#"><span style="font-size:28px">';	
	var end = '</span></a></li>';
	var out = "";
	for (i=0; i<jArray.length; i++){
		var jObject = jArray[i];
		myDest[jObject.name] = new google.maps.LatLng(jObject.endX, jObject.endY);
		out += start + jObject.name + preName + jObject.name + end;

	}
	//console.log(out);
	document.getElementById('rutasUL').innerHTML += out;
}


function addDest(jObject){
	var i;
	var start = '<li class="misRutas" data-name="';
	var preName = '"><a href="#"><span style="font-size:28px">';	
	var end = '</span></a></li>';
	var out = "";
        out += start + jObject.name + preName + jObject.name + end;


	//console.log(out);
	document.getElementById('rutasUL').innerHTML += out;
}

function processMyRoutes(response){
	var i;
	var start = '<li class="misRutas" data-pts=\'';
	var preName = '\'><a href="#"><span style="font-size:28px">';	
	var preHora = '</span><dd><span class="column-text" style="font-size:16px;">Hora de Partida:&nbsp</span><span class="column-text" style="font-weight:lighter;font-size:14px;">';
	var preDias = '</span></dd><dd><span class="column-text" style="font-size:16px;">Dias:</span><span class="column-text" style="font-weight:lighter;font-size:14px;">';
	var end = '</span></dd></a></li>';
	var out = "";
        var jArray = response.array;
	for (i=0; i<jArray.length; i++){
		var jObject = jArray[i];
		out += start + JSON.stringify(jObject.points) + preName + jObject.name + preHora + getHourString(jObject.hour) + preDias + getDias(jObject.days) + end;
	}
	console.log("rutas: " + out);
	document.getElementById('rutasUL').innerHTML = out;
}

function addRoute(jObject){
	var i;
	var start = '<li class="misRutas" data-name="';
	var preName = '"><a href="#"><span style="font-size:28px">';	
	var preHora = '</span><dd><span class="column-text" style="font-size:16px;">Hora de Partida:</span><span class="column-text" style="font-weight:lighter;font-size:14px;">';
	var preDias = '</span></dd><dd><span class="column-text" style="font-size:16px;">Dias:</span><span class="column-text" style="font-weight:lighter;font-size:14px;">';
	var end = '</span></dd></a></li>';
	var out = "";
//	myRoutes[jObject.name] = [new google.maps.LatLng(jObject.startX, jObject.startY), new google.maps.LatLng(jObject.endX, jObject.endY)];
	out = start + jObject.name + preName + jObject.name + preHora + jObject.hora + preDias + getDias(jObject.dias) + end;
	
	console.log(" new : " + out);
	document.getElementById('rutasUL').innerHTML += out;
}

function processMyFollowers(jArray){
	var i;
	var start = '<div id="followersRow" class="row"><div class="mdl-card mdl-shadow--4dp"><div class="mdl-card__media"><img src="';
	var preName = '" width="120" height="120" border="0"alt="" style="padding:10px;"></div><div class="mdl-card__supporting-text"><a href="#" class="card-title">';
	var preFollowers = '</a></div><p class="card" style="margin-left:16px">Seguidores: ';
	var preFollowing = '<br>Siguiendo: ';
	var end = '</p><div><button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-js-ripple-effect mdl-button--colored">'  +'<i class="material-icons">textsms</i></button></div></div>';
	var out = "";
	for (i=0; i<jArray.length; i++){
		var jObject = jArray[i];
		out += start + jObject.avatar + preName + jObject.name + preFollowers + jObject.followers + preFollowing + jObject.following + end;
	}
	console.log(out);
	document.getElementById('followersRow').innerHTML = out;
}


function getMyRoutes(){
	handleJSON('/misRutas', processMyRoutes);
}

function getMyDestinations(){
	handleJSON('json/myDest.json', processMyDestinations);
}

function getFollowersNotifications(){
	handleJSON('json/followersNotifications.json', processFollowersNotifications);
}

function getFollowingsNotifications(startX, startY, endX, endY){
        console.log("followingsNotifications");
        var time = moment().hour() * 60 + moment().minute() - moment().startOf('day').minute(); 
	handleJSON('/rutasCerca?day=' + moment().format('E') + '&time=' + time + '&startX=' + startX + '&startY=' + startY + '&endX=' + endX + '&endY=' + endY, processFollowingsNotifications);
}
function getMyFollowers(){
	handleJSON('json/followers.json', processMyFollowers);
}

function clearFollowersNotification(){
	document.getElementById('active-follower-list').innerHTML = "";
}

function clearRutasColumn(){
	//document.getElementById('rutasUL').innerHTML = "";
        $("#newRouteForm").toggleClass("invisible");
        $("#rutasUL").toggleClass("invisible");
}

