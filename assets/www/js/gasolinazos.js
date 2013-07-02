$(document).ready(function() {
    var width = $(window).width();
    var height = $(window).height();
    /*$("#body").width(width);
    $("#body").height(height);
    */
    readyEstado();
    $("#boton_buscar").click(function(){
        $("#buscador").slideToggle(500);//toggle().animate({height:'15%'}, 500);
    })
    
    $("#buscar").click(function(n){
        buscarGasolineras();
    });
    $("#btnAltaGasolinera").click(function(n){
        guardaGasolinera();
    });
    initialize2();
    
    
    $('[name="filtros"]').change(function(){
        if($("#geo-lat").val() != 0 && $("#geo-lng").val()!= 0){
                    buscarGasolinerasCoord($("#geo-lat").val(), $("#geo-lng").val());
        }
    });
    $('.checkServicios').change(function(){
        if($("#geo-lat").val() != 0 && $("#geo-lng").val()!= 0){
                    buscarGasolinerasCoord($("#geo-lat").val(), $("#geo-lng").val());
       }
    });
    $("#btn-buscadorAvanzado").click(function(){
        $("#buscadorAvanzado").slideToggle(500);
    });
    
});

function readyEstado(){
        $("#estado").change(function(){
        $.ajax(
                            {
                                url: $("#base_url").val()+"index.php/gasolineras/buscaCiudad",
                                type: "post",
                                dataType: "html",
                                data:{
                                    estado:$("#estado").val()
                                },
                                success: function( strData ){
                                    $("#div-ciudad").html(strData);
                                    readyCiudad();
                                }
                            }							
                            );
    });
}
function readyCiudad(){
    $("#ciudad").change(function(){
                    $.ajax(
                            {
                                url: $("#base_url").val()+"index.php/gasolineras/buscaColonia",
                                type: "post",
                                dataType: "html",
                                data:{
                                    ciudad:$("#ciudad").val()
                                },
                                success: function( strData ){
                                        $("#div-colonia").html(strData);
                                }
                            }							
                            );
    });
}	

function initialize2(data){
      map = new GMaps({
        div: '#map-canvas',
        lat: 19.423859,
        lng: -99.098053,
        zoom: 15,
        dragend: function(e) {
            if($("#hayListado").val() == null){
                buscarGasolinerasCoord(e.center.jb,e.center.kb);
            }
        }
      });
      GMaps.geolocate({
        success: function(position) {
          map.setCenter(position.coords.latitude, position.coords.longitude);
          $("#geo-lat").val(position.coords.latitude);
          $("#geo-lng").val(position.coords.longitude);
          var marker = map.addMarker({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              title: "Usted está aquí",
              icon: "img/marker_default.gif",
              draggable: true,
              infoWindow: {
                content: '<p>'+"usted está aquí"+'</p>'
              }
            });  
          google.maps.event.addListener(marker, 'dragend', function() {
              var position = marker.getPosition();
              var lat = position.lat();
              var lng = position.lng();
              $("#geo-lat").val(lat);
              $("#geo-lng").val(lng);
             // buscarGasolinerasCoord(lat, lng);
          });
          //buscarGasolinerasCoord(position.coords.latitude, position.coords.longitude);
        },
        error: function(error) {
          console.log('Geolocation failed: '+error.message);
        },
        not_supported: function() {
          alert("Su explorador no soporta la Geolocalización, le recomendamos actualizarlo.");
        },
        always: function() {
         // alert("Done!");
        }
      });
  return;
}

function cargaDatosMapa(data){
  var length = data.length;
  var latitud = ($("#latitud").val()!=0)?$("#latitud").val():data[0].latitud;
  var longitud = ($("#longitud").val()!=0)?$("#longitud").val():data[0].longitud;
  if(length>0){
      var markers = new Array();
      var reportes = 0;
      for (var i = 0; i < length; i++) {
          reportes = data[i].reportes.length;
          if(data[i].latitud != null && data[i].longitud != null && data[i].idgasolinera!= undefined){
              var color = calculaColor(data[i].promedio,data[i].votos,data[i].reportes);
              var botonMas = ((data[i].calificacion==0 || data[i].calificacion==null) && data[i].usuario!=0)?"botonMas":"botonGris";
              var botonMenos = ((data[i].calificacion==1 || data[i].calificacion==null) && data[i].usuario!=0)?"botonMenos":"botonGris";
              var opcionMas = ((data[i].calificacion==0 || data[i].calificacion==null) && data[i].usuario!=0)?'onclick="votar('+data[i].idgasolinera+',\'mas\');"' :(data[i].usuario==0)?'title="Debes iniciar sesión para poder votar"':'title="Ya haz votado por esta gasolinera"';
              var opcionMenos = ((data[i].calificacion==1 || data[i].calificacion==null) && data[i].usuario!=0)?'onclick="votar('+data[i].idgasolinera+',\'menos\');"' :(data[i].usuario==0)?'title="Debes iniciar sesión para poder votar"':'title="Ya haz votado por esta gasolinera"';
              var votos = (data[i].votos == null) ? 0 : data[i].votos;
            var marker = map.addMarker({
              
              lat: data[i].latitud,
              lng: data[i].longitud,
              title: data[i].estacion,
              icon: 'img/marker-'+color+'.gif',
              infoWindow: {
                content: '<!--<div id="infowindow_'+data[i].idgasolinera+'"></div><p>'+data[i].nombre+'<br>'+
                    '<small>'+data[i].direccion+'</small>'+'</p>-->'+'<div class="div_calificar">'+'<a href="#mapa" onclick=calculaRuta('+data[i].idgasolinera+');>Calcular Ruta</a>'+
'                        <table border="1" class="calificar">'+
'                            <tr>'+
'                                <td><button id="votoMas_'+data[i].idgasolinera+'" class="'+botonMas+'" '+opcionMas+'>+</button></td>'+
'                                <td rowspan="2"><span id="promedio_voto_'+data[i].idgasolinera+'">'+(data[i].promedio*100)+'</span>%<br>'+
'                                                <span id="votos_voto_'+data[i].idgasolinera+'">'+votos+'</span> votos'+
'                                </td>'+
'                            </tr>'+
'                            <tr>'+
'                                <td><button id="votoMenos_'+data[i].idgasolinera+'" class="'+botonMenos+'"  '+opcionMenos+'  >-</button></td>'+
'                            </tr>'+
'                        </table>'+
'                    </div>'
              }
            });
            markers[i] = data[i].idgasolinera;
          }
      }
  }
  return;
}

function buscarGasolineras(pagina){
    pagina = (typeof pagina === "undefined") ? 1 : pagina;

    $.ajax(
            {
                url: $("#base_url").val()+"index.php/gasolineras/buscarGasolineras/"+pagina,
                type: "post",
                dataType: "json",
                data:{
                    ciudad:$("#ciudad").val(),
                    estado:$("#estado").val(),
                    colonia:$("#colonia").val(),
                    texto:$("#buscador-texto").val()
                },
                success: function( data ){
                    parseDatos(data,"buscador");
                    map.setZoom(13);
                }
            }							
        );
}

function buscarGasolinerasCoord(latitud,longitud,pagina){
    pagina = (typeof pagina === "undefined") ? 1 : pagina;
    $("#latitud").val(latitud);
    $("#longitud").val(longitud);
    $("#position").val("true");
    var filtros_ar = filtrar();
    $.ajax(
            {
                url: $("#base_url").val()+"index.php/gasolineras/buscarGasolinerasCoord",
                type: "post",
                dataType: "json",
                data:{
                    filtros:JSON.stringify(filtros_ar),
                    latitud:latitud,
                    longitud:longitud,
                    geolat:$("#geo-lat").val(),
                    geolng:$("#geo-lng").val()
                },
                success: function( data ){
                    if(typeof data.error !== "undefined"){
                        alert(data.error);
                    }else{
                        parseDatos(data);
                        var datos = data;
                    }
                },
                complete: function(strData){
                    var datos = $.parseJSON(strData.responseText);
//                    activarInfowindow(datos); 
                }
            }							
        );
     return;
}

function parseDatos(data,buscador){
    if(buscador=="buscador"){
        var latitud = 0;
        var longitud = 0;
        var length_b = data.length;
        for(var i = 0;i<length_b;i++){
            latitud += parseFloat(data[i].latitud);
            longitud += parseFloat(data[i].longitud);
            
        }
        var center_lat = latitud / data.length;
        var center_lng = longitud / data.length;
        console.log(center_lat+", "+center_lng);
        map.setCenter(center_lat.toString(),center_lng.toString());
    }
    $("#ul-resultados").html("");
    $("#ul-resultados").append('<li data-role="list-divider">Resultadoss</li>');
   
    var lenAnt = $("#markers").val();
    if(lenAnt>0){
        map.removeMarkers();
        map.removePolylines();
        $("#position").val("false");
    }
    var latitud = 0;
    var longitud = 0;
    if($("#geo-lat").val() != 0 && $("#geo-lng").val() != 0){
        latitud = $("#geo-lat").val();
        longitud = $("#geo-lng").val();
    } else if(buscador=="buscador"){
        latitud = center_lat.toString();
        longitud = center_lng.toString();
    } else{
        latitud = $("#latitud").val();
        longitud = $("#longitud").val();
    }
    if(($("#latitud").val()!=0 && $("#longitud").val()!=0) || (center_lat!= 0 && center_lng!= 0)){
        var marker = map.addMarker({
            lat: latitud,
            lng: longitud,
            title: "Usted está aquí",
            icon: "img/marker_default.gif",
            draggable: true,
              infoWindow: {
                maxWidth: 500,
                minHeight: 800,
                content: '<p>'+"usted está aquí"+'<br>\n\
                            ¿Hay una gasolinera aquí? <a class="link" onclick="altaGasolinera();return false;">Darla de alta</a>\n\
                            </p>'
              }
            });  
          google.maps.event.addListener(marker, 'dragend', function() {
              var position = marker.getPosition();
              var lat = position.lat();
              var lng = position.lng();
              $("#geo-lat").val(lat);
              $("#geo-lng").val(lng);
              buscarGasolinerasCoord(lat, lng);
          });
        $("#position").val("true");
    }
    var length = data.length,
        element = null;
        $("#markers").val(length);
    var base_url = $("#base_url").val();
    //original, 1era vez, con geoloc, i = i+2
    //después del drag i = i+1
    //sin geoloc, buscar i=0
    //desupés del drag i = i+1;
    var j;
    if($("#position").val()=="false"){
        j=0;
    }else{
        j=1;
        if(map.markers[1] === undefined){
            console.log("und");
        }else{
            if(data[0].nombre != map.markers[1].getPosition()){ //por alguna razón cuando hay geoloc, el primer marker a veces es 1 y a veces es 2
                j=2;
            }
        }
    }
    for (var i = 0; i < length; i++) {
      var promedio = data[i].promedio * 100;
      var reportes_len = data[i].reportes.length;
      var promedio = data[i].promedio * 100;
      var reportes_len = data[i].reportes.length;
      if(reportes_len>0){
          var color_profeco = data[i].reportes[0].semaforo;
          switch(color_profeco){
              case "1":
                  color_profeco = "green";
              break;
              case "2":
                  color_profeco = "yellow";
              break;
              case "3":
                  color_profeco = "red";
              break;
              default:
                  color_profeco = "gray";
              break;
          }
      }else{
          var color_profeco = "gray";
      }
      var color = "";
      color = calculaColor(data[i].promedio,data[i].votos,data[i].reportes);
      var nombreGasolinera = data[i].nombre.substr(0,25);
      var distanciaGasolinera = (data[i].distancia<1000)?data[i].distancia.toFixed(2)+" m." : (data[i].distancia/1000).toFixed(2)+" km."
       $("#ul-resultados").append("<li class=' pan-to-marker' id='li-resultado-"+data[i].idgasolinera+"' title='"+data[i].direccion+"' data-marker-index='"+(i+j)+"' color='"+color+"'>"+
                                    '<fieldset class="ui-grid-a">'+
                                        '<div class="ui-block-a"  style="width:80%" onclick="calculaRuta('+data[i].idgasolinera+');">'+
                                            '<div data-role="fieldcontain">'+
                                                "<a href='#mapa'  style='color:#000000;text-decoration: none;'>"+
                                                "<span class='nombreEstacion'>"+nombreGasolinera+
                                                "<small> <b id='promedio_"+data[i].idgasolinera+"'>"+promedio+"</b>% </small></span>"+
                                                "<br><small>Profeco: <img src='"+base_url+"images/light-"+color_profeco+".png' style='float:none' />  distancia:"+distanciaGasolinera+"<small></a>"+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="ui-block-b" style="width:20%">'+
                                            '<div data-role="controlgroup" data-type="horizontal" >'+
                                               '<a href="estacion.html" data-rel="dialog" data-role="button" data-icon="arrow-r" id="boton-ver-'+data[i].idgasolinera+'" data-mini="true" data-iconpos="notext">Ver perfil</a> '+
                                            '</div>'+
                                        '</div>'+
                                    '</fieldset>'+
                                '</li>');
		$('#ul-resultados').listview('refresh');
                $('#boton-ver-'+data[i].idgasolinera).button();
    }
    $(document).on('mouseover', '.pan-to-marker', function(e) {
        e.preventDefault();

        var lat, lng;

        var $index = $(this).data('marker-index');
        var $lat = $(this).data('marker-lat');
        var $lng = $(this).data('marker-lng');
        var color = $(this).attr("color");
        if ($index != undefined) {
          // using indices
          var position = map.markers[$index].getPosition();
          lat = position.lat();
          lng = position.lng();
          var lastMarker = $("#current-marker").val();
          var lastMarkerColor = $("#current-marker-color").val();
          if(lastMarkerColor != 0){
            map.markers[lastMarker].setIcon( 'img/marker-'+lastMarkerColor+'.gif');
          }
          $("#current-marker").val($index);
          $("#current-marker-color").val(color);
          map.markers[$index].setIcon( 'img/marker-'+color+'-80.gif');
        }
        else {
          // using coordinates
          lat = $lat;
          lng = $lng;
        }
        map.setCenter(lat, lng);
      });
    cargaDatosMapa(data);
    return true;
}

function votar(idgasolinera,tipo){
    var voto = 0;
    if(tipo == "mas"){
        voto = 1;
    }else if (tipo == "menos"){
        voto = 0;
    }
    $.ajax(
    {
        url: $("#base_url").val()+"index.php/gasolinera/voto",
        type: "post",
        dataType: "json",
        data:{
            voto:voto,
            gasolinera:idgasolinera
        },
        success: function( strData ){
                var promedio = strData.promedio*100;
                $("#promedio_"+idgasolinera).html( promedio.toFixed(2) );
                $("#promedio_voto_"+idgasolinera).html( promedio.toFixed(2) );
                $("#votos_"+idgasolinera).html( strData.votos );
                $("#votos_voto_"+idgasolinera).html( strData.votos );
                var claseMas = (voto==1)?"botonGris":"botonMas";
                var claseMenos = (voto==0)?"botonGris":"botonMenos";
                var claseMasAnterior = $("#votoMas_"+idgasolinera).attr("class");
                var claseMenosAnterior = $("#votoMenos_"+idgasolinera).attr("class");
                $("#votoMas_"+idgasolinera).removeClass(claseMasAnterior);
                $("#votoMenos_"+idgasolinera).removeClass(claseMenosAnterior);
                $("#votoMas_"+idgasolinera).addClass(claseMas);
                $("#votoMenos_"+idgasolinera).addClass(claseMenos);
                
                if(voto==0){
                    $("#votoMenos_"+idgasolinera).removeAttr('onclick');
                    $("#votoMas_"+idgasolinera).attr('onclick','votar('+idgasolinera+',"mas");');
                }else{
                    $("#votoMas_"+idgasolinera).removeAttr('onclick');
                    $("#votoMenos_"+idgasolinera).attr('onclick','votar('+idgasolinera+',"menos");');
                }
        }
    });
}


function altaGasolinera(){
    $("#altaGasolinera").slideToggle(500);
}

function guardaGasolinera(){
    var lat = $("#geo-lat").val();
    var lng = $("#geo-lng").val();
    var estacion = $("#nuevaEstacion").val();
    $.ajax({
        url:$("#base_url").val()+"index.php/gasolinera/nuevaEstacion",
        data:{
            latitud:lat,
            longitud:lng,
            estacion:estacion
        },
        success:function(data){
            $("#altaGasolinera").slideToggle(500);
            $('#gracias').fadeIn(400).delay(2000).slideUp(300);
        }
    });
}

function calculaColor(promedio,votos,reportes){
    var color = "";
    var reportes_len = reportes.length;
    if($('#gasolinazos').is(':checked')){
        if(promedio<=1.00 && promedio>=0.85){
            color = "green";
        } else if (promedio<0.85 && promedio>=0.65){
            color = "yellow";
        } else if (promedio<0.65 && promedio>=0.00 && votos>0){
            color = "red";
        } else {
            if(reportes_len>0){
                if(reportes[0].semaforo==3){
                    color = "red";
                }else if(reportes[0].semaforo==2){
                    color = "yellow";
                }else if(reportes[0].semaforo==1){
                    color = "green";
                }
            }else{
                color = "gray";
            }
        }
    }else{
        if(reportes_len>0){
            if(reportes[0].semaforo==3){
                color = "red";
            }else if(reportes[0].semaforo==2){
                color = "yellow";
            }else if(reportes[0].semaforo==1){
                color = "green";
            }
        }else{
            if(promedio<=1.00 && promedio>=0.85){
                color = "green";
            } else if (promedio<0.85 && promedio>=0.65){
                color = "yellow";
            } else if ((promedio<0.65 && promedio>=0.01) || (promedio==0 && votos>0)){
                color = "red";
            } else {
                color = "gray";
            }
        }
    }
       
        return color;
}

function filtrar(){
    var filtros_ar = new Object();
    if($('#magna').is(':checked')){
        filtros_ar.magna = true;
    }
    if($('#premium').is(':checked')){
        filtros_ar.premium = true;
    }
    if($('#diesel').is(':checked')){
        filtros_ar.diesel = true;
    }
    if($('#dme').is(':checked')){
        filtros_ar.dme = true;
    }
    if($('#cualli').is(':checked')){
        filtros_ar.cualli = true;
    }
    if($('#vpm').is(':checked')){
        filtros_ar.vpm = true;
    }
   
    return filtros_ar;
}

function calculaRuta(idgasolinera){
    if($("#geo-lat").val() == 0 && $("#geo-lng").val() == 0){
        alert("Debe habilitar la geolocalización en su explorador para poder calcular rutas");
        return false;
    }
    map.removeMarkers();
    $.ajax({
        url:$("#base_url").val()+"index.php/gasolinera/estacionByID",
        data:{
            idgasolinera:idgasolinera
        },
        type:"post",
        dataType: "json",
        success:function(data){
          var marker = map.addMarker({
            lat: data.latitud,
            lng: data.longitud,
            icon: 'img/marker-star.png',
            title: "PEMEX estación "+data.estacion
          });   
            
          map.setCenter($("#geo-lat").val(), $("#geo-lng").val());
          var marker = map.addMarker({
              lat: $("#geo-lat").val(),
              lng: $("#geo-lng").val(),
              title: "Usted está aquí",
              icon: "img/marker_default.gif",
              draggable:true,
              infoWindow: {
                content: '<p>'+"usted está aquí"+'</p>'
              }
            });
            google.maps.event.addListener(marker, 'dragend', function() {
                map.removePolylines();
                var position = marker.getPosition();
                var lat = position.lat();
                var lng = position.lng();
                $("#geo-lat").val(lat);
                $("#geo-lng").val(lng);
                trazaRuta(data.latitud,data.longitud,data);
            });
            trazaRuta(data.latitud,data.longitud,data);
        }
    });
        
}

function trazaRuta(latitud,longitud,estacion){
        $("#ul-resultados").html("");
        $('#ul-resultados').append('<li onclick="buscarGasolinerasCoord('+latitud+','+longitud+');" id="regresarListado"><a href="#">Regresar a listado</a></li>');
        $('#ul-resultados').append('<li>'+estacion.estacion+" "+estacion.nombre+'</li>');
		map.drawRoute({
            origin: [$("#geo-lat").val(), $("#geo-lng").val()],
            destination: [latitud,longitud],
            travelMode: 'driving',
            strokeColor: '#131540',
            strokeOpacity: 0.6,
            strokeWeight: 6
        });
        var i=0;var clase="";
        map.travelRoute({
            origin: [$("#geo-lat").val(), $("#geo-lng").val()],
            destination: [latitud,longitud],
            travelMode: 'driving',
            step: function(e) {
                if(i==0){
                    clase="non";
                    i=1;
                }else{
                    clase="par";
                    i=0;
                }
              $('#ul-resultados').append('<li class="'+clase+'">'+e.instructions+'</li>');
              $('#ul-resultados li:eq(' + e.step_number + ')').delay(450 * e.step_number);
			  $('#ul-resultados').listview('refresh');

            }
          });
}