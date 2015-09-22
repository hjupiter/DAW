function ponerPalabraSeguidor(){
    var option = document.getElementById("seguidores_select").value;
    var paraMensaje = document.getElementById("paraMensaje");
    document.getElementById("paraMensaje").innerHTML = "Para: " + option;
}

function archivo(evt) {
    var files = evt.target.files; // FileList object
    // Obtenemos la imagen del campo "file".
    for (var i = 0, f; f = files[i]; i++) {
        //Solo admitimos imágenes.
        if (!f.type.match('image.*')) {
            continue;
        }
        var reader = new FileReader();
        reader.onload = (function (theFile) {
            return function (e) {
                // Insertamos la imagen
                document.getElementById("list").innerHTML = ['<img id="imaUser" class="img-responsive center-block img-circle text-center" src="', e.target.result, '" title="', escape(theFile.name), '"/>'].join('');
            };
        })(f);
        reader.readAsDataURL(f);
    }
}

function habilitaImagenDiv(){
    var formularioImagen = document.getElementById("formularioImagen");
    formularioImagen.setAttribute("style","display:normal;");
}

function desabilitaImagenDiv(){
    var formularioImagen = document.getElementById("formularioImagen");
    formularioImagen.setAttribute("style","display:none;");
}

$(document).ready( function(){
    $("body").on('click', 'a.divSeguidor', function(){

    });
});

function logout(){
    $.post('/logout', {}, function (data){ 
        console.log("logout: " + data);
        location.reload(true);
    });
}

function driver(){
    $.get('/driver', {}, function (data){ 
        location.href='driver';
    });
}

function siguiendo(){
    $.get('/siguiendo',{},function (data){
        location.href='siguiendo';
    });
}

$(function() {
    $(":file").filestyle('iconName', 'glyphicon glyphicon-pencil');
    $(":file").filestyle('buttonText', '');
  // Aquí añadiremos nuestro código
});

function pass(){
    $.get('/siguiendo',{},function (data){
        location.href='pass';
    });
}

function miPerfil(){
    window.location.href = "/inicio";
}


//document.getElementById('files').addEventListener('change', archivo, false);