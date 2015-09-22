function loadData(){
    //getMyDestinations();
    google.maps.event.addListener(map, 'click', clickToGo);
}

function getPageType(){
    return "walk";
}

function replaceWhitespace(name){
    return name.replace(' ', whitespace);
}

function clearNewRouteForm(){
    $('#routename').val("");
}

function nuevaMapData(){
    console.log("nuevaMapData");
    if(!agregandoData){

        clearRuta();
        escogerInicio();

    start = new google.maps.Marker({
    position: currentPosition,
        title: '#',
        draggable:true,
        map: map
    });
    google.maps.event.addListener(map, 'click', addLatLng);
    }

}


function submitContent(){
    var newDest = [];
    newDest.name = $('#routename').val();
    if(!isValidAlphaNumericName(replaceWhitespace(name))){
        console.log("wrong name");
        return;
    }
    myDest[replaceWhitespace(newDest.name)] =  end.position;
    clearRutasColumn();
    addDest(newDest);
    //getMyRoutes();
    agregandoData = false;
    console.log("chao " + agregandoData);
    clearNewDataForm();
}
 
function siguiendo(){
    $.get('/siguiendo',{},function (data){
        location.href='siguiendo';
    });
}