$(document).ready(function() {
	$.mobile.loading('show');
    var width = $(window).width();
    var height = $(window).height();
    /*$("#body").width(width);
    $("#body").height(height);
    */
	var altura_mapa = height*.70;
	
	$("#mapa").height(altura_mapa);
	$("#map_canvas").height(altura_mapa);
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
	
	$(document).on('pageshow', '#second', function(e){   
		$("#comentarios-estacion").html("");
		$.mobile.loading('show');
		$.ajax({
				url: $("#base_url").val()+"index.php/gasolinera/getPerfilEstacion",
				type: "post",
				dataType: "json",
				data:{
					idgasolinera:$("#gasolinera-mostrada").val(),
					latitud:$("#geo-lat").val(),
					longitud:$("#geo-lng").val()
				},
				success: function( strData ){
					//$("#contenido-gasolinera").html(strData);
					cargaDatosEstacion(strData);
					$.mobile.loading('hide');
					
					var ref = "http://skrik1893.startlogic.com/gasolinazos/index.php/gasolinera/estacion/"+strData.estacion;
					/*$("#comentarios-estacion").html('<div id="fb-root" class="fb-root"></div><fb:comments href="'+ref+'" num_posts="10" id="fb-comments"></fb:comments>');
						(function(d, s, id) {
						  var js, fjs = d.getElementsByTagName(s)[0];
						  if (d.getElementById(id)) return;
						  js = d.createElement(s); js.id = id;
						  js.src = "//connect.facebook.net/es_LA/all.js#xfbml=1&appId=465561006870893";
						  fjs.parentNode.insertBefore(js, fjs);
						}(document, 'script', 'facebook-jssdk'));
						
					$("#fb-comments").attr('href', ref);
					FB.XFBML.parse();	
					$("#comentarios-estacion").width(width);
					$("#comentarios-estacion").attr("width",width);*/
					
				}
			});
	});
	
	$.mobile.loading('hide');
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
            if($("#regresar-main").attr("show") == "false"){
                buscarGasolinerasCoord(e.center.jb,e.center.kb);
            }
        }
      });
	  console.log("inicializando");
      GMaps.geolocate({
        success: function(position) {
			console.log(position);
          map.setCenter(position.coords.latitude, position.coords.longitude);
          $("#geo-lat").val(position.coords.latitude);
          $("#geo-lng").val(position.coords.longitude);
          /*var marker = map.addMarker({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              title: "Usted está aquí",
              icon: "img/marker.png",
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
              buscarGasolinerasCoord(lat, lng);
          });*/
          buscarGasolinerasCoord(position.coords.latitude, position.coords.longitude);
        },
        error: function(error) {
          console.log('Geolocation failed: '+error.message);
        },
        not_supported: function() {
          alert("Su explorador no soporta la Geolocalización, le recomendamos actualizarlo.");
        },
        always: function(v) {
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
          reportes = data[i].reportes.length;j=0;
          if(data[i].latitud != null && data[i].longitud != null && data[i].idgasolinera!= undefined){
              var color = calculaColor(data[i].promedio,data[i].votos,data[i].reportes);
              var botonMas = ((data[i].calificacion==0 || data[i].calificacion==null))?"botonMas":"botonGris";
              var botonMenos = ((data[i].calificacion==1 || data[i].calificacion==null))?"botonMenos":"botonGris";
              var opcionMas = ((data[i].calificacion==0 || data[i].calificacion==null) )?'onclick="votar('+data[i].idgasolinera+',\'mas\');"' :'title="Ya haz votado por esta gasolinera"';
              var opcionMenos = ((data[i].calificacion==1 || data[i].calificacion==null) )?'onclick="votar('+data[i].idgasolinera+',\'menos\');"' :'title="Ya haz votado por esta gasolinera"';
              var votos = (data[i].votos == null) ? 0 : data[i].votos;
            var marker = map.addMarker({
              
              lat: data[i].latitud,
              lng: data[i].longitud,
              title: data[i].estacion,
              icon: 'img/marker-'+color+'.gif',
              infoWindow: {
                content: '<div id="infowindow_'+data[i].idgasolinera+'"></div><p>'+data[i].nombre+'<br>'+
                    '<small>'+data[i].direccion+'</small>'+'</p>'+'<div class="div_calificar">'+
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
'                        </table>'+botones(data[i],color,i,j,"infowindow")+
'                    </div>'
              }
            });
/*			$("#open-dialog-infowindow-"+data[i].idgasolinera).click(function(){
				$.mobile.changePage('#second','pop',false,true);
			});*/
            markers[i] = data[i].idgasolinera;
          }
      }
  }
  $.mobile.loading('hide');
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
	$.mobile.loading('show');
    pagina = (typeof pagina === "undefined") ? 1 : pagina;
    $("#latitud").val(latitud);
    $("#longitud").val(longitud);
    $("#position").val("true");
    var filtros_ar = filtrar();
    $.ajax(
            {
                url: $("#base_url").val()+"index.php/gasolineras/buscarGasolinerasCoordWS",
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
    $("#ul-resultados").append('<li data-role="list-divider">Resultados</li>');
   
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
            icon: "img/marker.png",
            draggable: true,
              infoWindow: {
                maxWidth: 500,
                minHeight: 800,
                content: '<p>'+"usted está aquí"+'<br>\n\
                            ¿Hay una gasolinera aquí? <a class="link" onclick="altaGasolinera();return false;">Darla de alta</a>\n\
                            </p>'
              }
            });  
			if($("#intervalo").val() == "true"){
				setInterval(function()
				{ 
					actualizaPunto(marker);
				}, 5000);
				$("#intervalo").val("false");
			}
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
      var distanciaGasolinera = (data[i].distancia<1000)?data[i].distancia.toFixed(2)+" m." : (data[i].distancia/1000).toFixed(2)+" km.";
       $("#ul-resultados").append("<li id='li-resultado-"+data[i].idgasolinera+"' title='"+data[i].direccion+"' color='"+color+"'>"+
                                    '<fieldset class="ui-grid-a">'+
                                        '<div class="ui-block-a"  style="width:100%">'+
                                            '<div data-role="fieldcontain">'+
                                                "<a href='#' id='open-dialog-"+data[i].idgasolinera+"' idgasolinera='"+data[i].idgasolinera+"' style='color:#000000;text-decoration: none;'>"+
                                                "<span class='nombreEstacion'>"+nombreGasolinera+
                                                "<small> <b id='promedio_"+data[i].idgasolinera+"'>"+promedio+"</b>% </small></span>"+
                                                "<br><small>Profeco: <img src='img/light-"+color_profeco+".png' style='float:none' />  distancia:"+distanciaGasolinera+"<small></a>"+
                                            '</div>'+
											botones(data[i],color,i,j,"")+
                                        '</div>'+
                                    '</fieldset>'+
                                '</li>');
		$('#ul-resultados').listview('refresh');
		$('.ui-block-b').trigger('create');
		$("#open-dialog-"+data[i].idgasolinera).click(function(){
			$.mobile.changePage('#second','pop',false,true);
		});
		
    }
	$(document).on('vclick', '.pan-to-marker', function(e) {
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

function botones(data,color,i,j,infowindow){
	var botones = '<div class="ui-corner-all ui-controlgroup ui-controlgroup-horizontal" data-type="horizontal" data-role="controlgroup" aria-disabled="false" data-disabled="false" data-shadow="false" data-corners="true" data-exclude-invisible="true" data-mini="false" data-init-selector=":jqmData(role=\'controlgroup\')">\n\
	<div class="ui-controlgroup-controls" style="border-radius: 5px 5px 5px 5px;">';
	var child = "";
	if(infowindow != "infowindow"){
		botones = botones + '<a class="ui-btn ui-btn-up-c ui-shadow ui-btn-corner-all ui-mini ui-btn-icon-left ui-first-child pan-to-marker" href="#" data-marker-index="'+(i+j)+'"  color="'+color+'" id="boton-centrar-'+data.idgasolinera+'"data-mini="true" data-icon="arrow-d" data-role="button" href="#" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="a">\n\
			<span class="ui-btn-inner">\n\
			<span class="ui-btn-text">Centrar</span>\n\
			<span class="ui-icon ui-icon-arrow-d ui-icon-shadow"> </span>\n\
			</span>\n\
		</a>';
		
	}else{
		botones = botones + '<a class="ui-btn ui-btn-up-c ui-shadow ui-btn-corner-all ui-mini ui-btn-icon-left ui-first-child" href="#" onclick="perfilGasolinera('+data.idgasolinera+');" idgasolinera="'+data.idgasolinera+'" id="open-dialog-infowindow-'+data.idgasolinera+'" data-mini="true" data-icon="arrow-d" data-role="button" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="a">\n\
			<span class="ui-btn-inner">\n\
			<span class="ui-btn-text">Perfil</span>\n\
			<span class="ui-icon ui-icon-arrow-d ui-icon-shadow"> </span>\n\
			</span>\n\
		</a>';
	}
	botones = botones + '<a class="ui-btn ui-btn-up-c ui-shadow ui-btn-corner-all ui-mini ui-btn-icon-left '+child+'" data-mini="true" data-icon="arrow-u" data-role="button" href="#" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="a"  onclick="calculaRuta('+data.idgasolinera+');">\n\
			<span class="ui-btn-inner">\n\
			<span class="ui-btn-text">Ruta</span>\n\
			<span class="ui-icon ui-icon-arrow-u ui-icon-shadow"> </span>\n\
			</span>\n\
		</a>\n\
		<a class="ui-btn ui-shadow ui-btn-corner-all ui-mini ui-btn-icon-left ui-last-child ui-btn-up-c" data-mini="true" data-icon="star" data-role="button" href="geo:'+data.latitud+','+data.longitud+'" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="a">\n\
			<span class="ui-btn-inner">\n\
			<span class="ui-btn-text">GPS</span>\n\
			<span class="ui-icon ui-icon-star ui-icon-shadow"> </span>\n\
			</span>\n\
		</a>\n\
	</div>\n\
</div>';
	return botones;
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
            gasolinera:idgasolinera,
			movil:7
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
              icon: "img/marker.png",
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
//        $('#ul-resultados').append('<li onclick="buscarGasolinerasCoord('+latitud+','+longitud+');" data-icon="arrow-l" id="regresarListado"><input type="hidden" id="hayListado" value="1"><a href="#">Regresar a listado</a></li>');
		$("#regresar-main").attr("latitud",latitud);
		$("#regresar-main").attr("longitud",longitud);
		$("#regresar-main").attr("show","true");
		$("#regresar-main").show();
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

function actualizaPunto(marker){
if($("#position").val()=="true"){

		GMaps.geolocate({
			success: function(position) {
		
			lat = parseFloat(position.coords.latitude);
			lat = lat.toString();
			
			lng = parseFloat(position.coords.longitude);
			lng = lng.toString();
			if(($("#geo-lat").val() - lat > 0.0001) || ($("#geo-lat").val() - lat < -0.0001)){
				console.log($("#geo-lat").val() - lat);

				$("#geo-lat").val(lat.toString());
				$("#geo-lng").val(lng.toString());
			
				console.log(lat+","+lng);
				var cnt = new google.maps.LatLng(lat, lng);
				marker.setPosition(cnt);
				map.setCenter(lat,lng);
			}else{
				console.log($("#geo-lat").val() - lat);
			}

        },
        error: function(error) {
          console.log('Geolocation failed: '+error.message);
        },
        not_supported: function() {
          //alert("Su explorador no soporta la Geolocalización, le recomendamos actualizarlo.");
        },
        always: function() {
         // alert("Done!");
        }
      });
}
}

function cargaDatosEstacion(data){
	console.log(data);
	$("#nombre-gas").html(data.estacion+" - "+data.nombre);
	$("#direccion-gas").html(data.direccion+" "+data.colonia+", "+data.nombre_ciudad+", "+data.nombre_estado);
	var distanciaGasolinera = (data.distancia<1000)?data.distancia.toFixed(2)+" m." : (data.distancia/1000).toFixed(2)+" km.";
	$("#distancia-gas").html(distanciaGasolinera);
	$("#telefono-gas").html(data.telefono);
	$("#correo-gas").html("<a href='mailto:"+data.email+"'>"+data.email+"</a>");
	var reportes_len = data.reportes.length;
	if(reportes_len>0){
          var color_profeco = data.reportes[0].semaforo;
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
	var promedio = data.promedio/100;
	var color = "";
	if(promedio<=1.00 && promedio>=0.85){
		color = "green";
	} else if (promedio<0.85 && promedio>=0.65){
		color = "yellow";
	} else if (promedio<0.65 && promedio>=0.00 && data.votos>0){
		color = "red";
	} else {
		color = "gray";
	}
	promedio = promedio * 100;
	
	$("#profeco-gas").html("<img src='img/light-"+color_profeco+".png' style='float:none' /> ");
	$("#gasolinazos-gas").html("<img src='img/light-"+color+".png' style='float:none' /> "+promedio.toFixed(2)+"% ("+data.votos+" votos)");
	$("#servicios-gas").html("");
	for( var i in data.productos){
		$("#servicios-gas").append("<img src=\"img/"+data.productos[i].nombre.toLowerCase()+".png\" /><br>");
		console.log(data.productos[i].nombre);
	}
}

function regresarAListado(){
	var latitud = $("#regresar-main").attr("latitud");
	var longitud = $("#regresar-main").attr("longitud");
	$("#regresar-main").attr("show","false");

	buscarGasolinerasCoord(latitud,longitud);
	$("#regresar-main").hide();
}

function perfilGasolinera(idgasolinera){
	$("#gasolinera-mostrada").val(idgasolinera);
	$.mobile.changePage('#second','pop',false,true);
}