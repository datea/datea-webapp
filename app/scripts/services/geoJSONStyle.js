'use strict';

angular.module('dateaWebApp')
.factory('geoJSONStyle', function () {
	return {
	  style: function (feature) {
				// TRANSLATE MAPBOX SIMPLE STYLE
				var prop = feature.properties;
				if (prop.stroke && prop.stroke.charAt(0) === '#') {
					prop.color = prop.stroke;
					prop.stroke = true;
				}
				if (prop['stroke-opacity']) prop.opacity = prop['stroke-opacity'];
				if (prop['stroke-width']) prop.weight = prop['stroke-width'];
				if (prop.fill) prop.fillColor = prop.fill;
				if (prop['fill-opacity']) prop.fillOpacity = prop['fill-opacity'];
				return prop;
			}
	, pointToLayer: function(feature, latlon) {
				var marker, label;
				if (feature.properties['marker-size'] && feature.properties['marker-color']) {
          var sizes = {
              small  : [20, 50]
            , medium : [30, 70]
            , large  : [35, 90]
          };
          var fp     = feature.properties || {};
          var size   = fp['marker-size'] || 'medium';
          var symbol = (fp['marker-symbol']) ? '-' + fp['marker-symbol'] : '';
          var color  = fp['marker-color'] || '7e7e7e';
          color      = color.replace('#', '');

          var url = 'http://a.tiles.mapbox.com/v3/marker/' +
                'pin-' +
                // Internet Explorer does not support the `size[0]` syntax.
                size.charAt(0) + symbol + '+' + color +
                ((window.devicePixelRatio === 2) ? '@2x' : '') +
                '.png';

          marker = new L.Marker(latlon, {
              icon: new L.icon({
                    iconUrl: url
                  , iconSize: sizes[size]
                  , iconAnchor: [sizes[size][0] / 2, sizes[size][1] / 2]
                  , popupAnchor: [sizes[size][0] / 2, 0]
              })
          });
      	}else{
      		marker = L.Marker(latlon);
      	}
      	if (feature.properties.title || feature.properties.name) {
      		label = feature.properties.title || feature.properties.name;
      		marker.bindLabel(label);
      	}
      	return marker;
    }
  , onEachFeature: function (feature, layer) {
    	var content;
    	if (feature.properties.description || feature.properties.popupContent) {
    		content = feature.properties.description || feature.properties.popupContent;
    		layer.bindPopup(content);
    	}
    }
	}

}); 
