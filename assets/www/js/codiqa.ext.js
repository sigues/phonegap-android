// Put your custom code here


$(document).ready(function(){
	var width = $(window).width();
    var height = $(window).height();
	console.log(width);
    $("#map-canvas").width(width-30);
});

function initialize2(data){
    map = new GMaps({
      div: '#map-canvas',
      lat: 19.423859,
      lng: -99.098053,
      zoom: 15,
      dragend: function(e) {
          buscarGasolinerasCoord(e.center.jb,e.center.kb);
      }
    });
    
    GMaps.geolocate({
      success: function(position) {
         // alert(position.coords.latitude+", "+position.coords.longitude);
        map.setCenter(position.coords.latitude, position.coords.longitude);
        $("#geo-lat").val(position.coords.latitude);
        $("#geo-lng").val(position.coords.longitude);
        var marker = map.addMarker({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            title: "Usted está aquí",
            icon: "https://maps.google.com/mapfiles/kml/shapes/"+'poi.png',
            infoWindow: {
              content: '<p>'+"usted está aquí"+'</p>'
            }
          });  
        buscarGasolinerasCoord(position.coords.latitude, position.coords.longitude);
      },
      error: function(error) {
        console.log('Geolocation failed: '+error.message);
        //$(".layer2").hide();
      },
      not_supported: function() {
        alert("Su explorador no soporta la Geolocalización, le recomendamos actualizarlo.");
       // $(".layer2").hide();
      },
      always: function() {
      // $(".layer2").hide();
      }

    });
    
    
return true;
}

function cargaDatosMapa(data){
var length = data.length;
var latitud = ($("#latitud").val()!=0)?$("#latitud").val():data[0].latitud;
var longitud = ($("#longitud").val()!=0)?$("#longitud").val():data[0].longitud;
if(length>0){
   /* map = new GMaps({
      div: '#map-canvas',
      lat: latitud,
      lng: longitud,
      zoom: 15,
      dragend: function(e) {
          buscarGasolinerasCoord(e.center.jb,e.center.kb);
      }
    });*/
    var markers = new Array();
    var reportes = 0;
   // var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < length; i++) {
//        alert(data[i].latitud+" - "+data[i].longitud);
          reportes = data[i].reportes.length;
//          console.log(data[i].reportes);
        if(data[i].latitud != null && data[i].longitud != null && data[i].idgasolinera!= undefined){
            var color = "";
            /*if(data[i].promedio==1.00){
                color = "star";
            } else */if(data[i].promedio<=1.00 && data[i].promedio>=0.85){
                color = "green";
            } else if (data[i].promedio<0.85 && data[i].promedio>=0.65){
                color = "yellow";
            } else if (data[i].promedio<0.65 && data[i].promedio>=0.00 && data[i].votos>0){
                color = "red";
            } else {
                if(reportes>0){
                    if(data[i].reportes[0].semaforo==3){
                        color = "red";
                    }else if(data[i].reportes[0].semaforo==2){
                        color = "yellow";
                    }else if(data[i].reportes[0].semaforo==1){
                        color = "green";
                    }
                }else{
                    color = "gray";
                }
            }
          var marker = map.addMarker({
              
            lat: data[i].latitud,
            lng: data[i].longitud,
            title: data[i].estacion,
            icon: $("#base_url").val()+'images/marker-'+color+'.png',
            infoWindow: {
              content: '<!--<div id="infowindow_'+data[i].idgasolinera+'"></div><p>'+data[i].nombre+'<br>'+
                  '<small>'+data[i].direccion+'</small>'+'</p>-->'+'<div class="div_calificar">'+'<a href="'+$("#base_url").val()+'/index.php/gasolinera/estacion/'+data[i].estacion+'/ruta">Calcular Ruta</a>'+
'                        <table border="1" class="calificar">'+
'                            <tr>'+
'                                <td><button id="votoMas_'+data[i].idgasolinera+'" class="botonMas" onclick="votar('+data[i].idgasolinera+',\'mas\')">+</button></td>'+
'                                <td rowspan="2"><span id="promedio_voto_'+data[i].idgasolinera+'">'+(data[i].promedio*100)+'</span>%<br>'+
'                                                <span id="votos_voto_'+data[i].idgasolinera+'">'+data[i].votos+'</span> votos'+
'                                </td>'+
'                            </tr>'+
'                            <tr>'+
'                                <td><button id="votoMenos_'+data[i].idgasolinera+'" class="botonMenos" onclick="votar('+data[i].idgasolinera+',\'menos\')"  >-</button></td>'+
'                            </tr>'+
'                        </table>'+
'                    </div>'

            }
            
          });
          
        //  bounds.extend(new google.maps.LatLng(marker.lat, marker.lng));  
          //if(i <2){
//              bounds.extend(marker);
           //   console.log(marker)
          // }
//          con++;
          markers[i] = data[i].idgasolinera;
        }
    }
  //  map.fitLatLngBounds(bounds);

    //console.log(markers)
    //http://hpneo.github.io/gmaps/examples/interacting.html
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
              //    console.log(data);
//                  activarInfowindow(data);
              }
          }							
      );
}

function buscarGasolinerasCoord(latitud,longitud,pagina){
  pagina = (typeof pagina === "undefined") ? 1 : pagina;
  $("#latitud").val(latitud);
  $("#longitud").val(longitud);
  $("#position").val("true");
//  console.log($("#latitud").val(latitud));
//  console.log($("#longitud").val(longitud));
  $.ajax(
          {
              url: $("#base_url").val()+"index.php/gasolineras/buscarGasolinerasCoord",
              type: "post",
              dataType: "json",
              data:{
                  latitud:latitud,
                  longitud:longitud,
                  geolat:$("#geo-lat").val(),
                  geolng:$("#geo-lng").val()
              },
              success: function( data ){
                  parseDatos(data);
                  var datos = data;
              },
              complete: function(strData){
                  var datos = $.parseJSON(strData.responseText);
//                  activarInfowindow(datos); 
              }
          }							
      );
   return;
}

function parseDatos(data,buscador){
  if(buscador=="buscador"){
      map.setCenter(data[0].latitud,data[0].longitud);
  }
  $("#ul-resultados").html("");
  var lenAnt = $("#markers").val();
  if(lenAnt>0){
      map.removeMarkers();
      $("#position").val("false");
  }
  var latitud = 0;
  var longitud = 0;
  if($("#geo-lat").val() != 0 && $("#geo-lng").val() != 0){
      latitud = $("#geo-lat").val();
      longitud = $("#geo-lng").val();
  }else{
      latitud = $("#latitud").val();
      longitud = $("#longitud").val();
  }
  if($("#latitud").val()!=0 && $("#longitud").val()!=0){
      var marker = map.addMarker({
          lat: latitud,
          lng: longitud,
          title: "Usted está aquí",
          icon: "https://maps.google.com/mapfiles/kml/shapes/"+'poi.png',
          infoWindow: {
            content: '<p>'+"usted está aquí"+'</p>'
          }
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
  /*    var pos = map.markers[0];
      if(pos === undefined){ //por alguna razón cuando hay geoloc, el primer marker a veces es 1 y a veces es 2
          j=1;
      }*/
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
    var color = "";
      /*if(data[i].promedio==1.00){
          color = "star";
      } else */if(data[i].promedio<=1.00 && data[i].promedio>=0.85){
          color = "green";
      } else if (data[i].promedio<0.85 && data[i].promedio>=0.65){
          color = "yellow";
      } else if (data[i].promedio<0.65 && data[i].promedio>=0.01){
          color = "red";
      } else {
          if(reportes_len>0){
              if(data[i].reportes[0].semaforo==3){
                  color = "red";
              }else if(data[i].reportes[0].semaforo==2){
                  color = "yellow";
              }else if(data[i].reportes[0].semaforo==1){
                  color = "green";
              }
          }else{
              color = "gray";
          }
      }
    $("#ul-resultados").append("<li class='"+color+"'>"+data[i].nombre+" <small><b id='promedio_"+data[i].idgasolinera+"'>"+promedio+"</b>% <a href='"+base_url+"index.php/gasolinera/estacion/"+data[i].estacion+"'>(ver perfil)</a> <a href='#map-canvas' class='pan-to-marker' data-marker-index='"+(i+j)+"'>Ubicar</a></small>"
        +"<br><small>Profeco: "+reportes_len+" distancia:"+data[i].distancia.toFixed(2)+" metros<small></li>");
  }
  $(document).on('mouseover', '.pan-to-marker', function(e) {
      e.preventDefault();

      var lat, lng;

      var $index = $(this).data('marker-index');
      var $lat = $(this).data('marker-lat');
      var $lng = $(this).data('marker-lng');

      if ($index != undefined) {
        // using indices
        var position = map.markers[$index].getPosition();
        lat = position.lat();
        lng = position.lng();
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
      }
  }							
  );
}

window.CodiqaControls = {
		  types: {},
		  instances: {},

		  define: function(type, control) {
		    control._type = type;
		    this.types[type] = control;
		  },

		  register: function(type, id, opts) {
		    var instance = new this.types[type]();
		    instance._type = type;
		    instance._id = id;
		    instance._opts = opts;
		    this.instances[id] = instance;

		    if(!this.types[type].prototype._isInited) {
		      this.types[type].prototype.initType();
		    }
		    return instance;
		  },

		  init: function() {
		    for(var type in this.types) {
		      this.types[type].prototype.initType();
		    }
		  },

		  refresh: function() {
		    for(var x in this.instances) {
		      this.instances[x].refresh && this.instances[x].refresh();
		    }
		  },

		  callbackInit: function() {

		  },

		  getInstances: function(type) {
		    var x, instance, instances = [];
		    for(x in this.instances) {
		      instance = this.instances[x];
		      if(instance._type === type) {
		        instances.push(instance);
		      }
		    }
		    return instances;
		  }

		};


		CodiqaControls.GoogleMap = function () {};
		CodiqaControls.GoogleMap.prototype.initType = function() {
		  if( window.CodiqaControls.getInstances('googlemaps').length ) {
		    var script = document.createElement('script');
		    script.type = "text/javascript";
		    script.src = "https://maps.googleapis.com/maps/api/js?sensor=true&callback=CodiqaControls.types.googlemaps.prototype.callbackInit";
		    document.getElementsByTagName("head")[0].appendChild(script);
		    CodiqaControls.GoogleMap.prototype._isInited = true;
		  }
		};
		CodiqaControls.GoogleMap.prototype.callbackInit = function() {
		  var x, instances = window.CodiqaControls.getInstances('googlemaps');
		  for(x = 0; x < instances.length; x++) {
		    instances[x]._opts.ready(instances[x]);
		  }
		};
		CodiqaControls.GoogleMap.prototype.refresh = function() {
		  if( this.map && this.el && $(this.el).closest('.ui-page-active').length ) {
		    google.maps.event.trigger(this.map, 'resize');
		    this.center && this.map.setCenter(this.center);
		  }
		};
		window.CodiqaControls.define('googlemaps', CodiqaControls.GoogleMap);



		(function($) {
		  $.widget('mobile.tabbar', $.mobile.navbar, {
		    _create: function() {
		      // Set the theme before we call the prototype, which will 
		      // ensure buttonMarkup() correctly grabs the inheritied theme.
		      // We default to the "a" swatch if none is found
		      var theme = this.element.jqmData('theme') || "a";
		      this.element.addClass('ui-footer ui-footer-fixed ui-bar-' + theme);

		      // Make sure the page has padding added to it to account for the fixed bar
		      this.element.closest('[data-role="page"]').addClass('ui-page-footer-fixed');


		      // Call the NavBar _create prototype
		      $.mobile.navbar.prototype._create.call(this);
		    },

		    // Set the active URL for the Tab Bar, and highlight that button on the bar
		    setActive: function(url) {
		      // Sometimes the active state isn't properly cleared, so we reset it ourselves
		      this.element.find('a').removeClass('ui-btn-active ui-state-persist');
		      this.element.find('a[href="' + url + '"]').addClass('ui-btn-active ui-state-persist');
		    }
		  });

		  $(document).on('pagecreate create', function(e) {
		    return $(e.target).find(":jqmData(role='tabbar')").tabbar();
		  });
		  
		  $(document).on('pageshow', ":jqmData(role='page')", function(e) {
		    // Grab the id of the page that's showing, and select it on the Tab Bar on the page
		    var tabBar, id = $(e.target).attr('id');

		    tabBar = $.mobile.activePage.find(':jqmData(role="tabbar")');
		    if(tabBar.length) {
		      tabBar.tabbar('setActive', '#' + id);
		    }

		    window.CodiqaControls.refresh();
		  });

		  window.CodiqaControls.init();
		  
		})(jQuery);