'use strict';

angular.module( 'dateaWebApp' )
.controller( 'CampaignDashboardCtrl'
, [ '$scope'
  , 'Api'
  , 'geolocation'
  , 'config'
  , 'leafletData'
, function (
    $scope
  , Api
  , geo
  , config
  , leafletData
) {

	var sup
	// boundary map options fix
	  , drawnItems  = new L.FeatureGroup()
	  , options     = { edit: { featureGroup: drawnItems }
	                  , draw: { marker: false, polyline: false, circle: false, rectangle: false, polygon: { allowIntersection: false } } }
	  , drawControl = new L.Control.Draw(options)
	// fn declarations
	  , buildCategories
	  , buildBoundariesMap
	  , onGeolocation
	  , onGeolocationError
	  ;

	$scope.newCampaign = {};
	$scope.flow        = {};
	$scope.flow.categories;

	$scope.newCampaign.leaflet = {};

onGeolocation = function ( data ) {
	var leaflet = {};
	console.log('sup onGeolocation')
	leaflet.center = { lat  : data.coords.latitude
	                 , lng  : data.coords.longitude
	                 , zoom : config.dashboard.defaultZoom
	                 }
	leaflet.controls = { draw : { marker: false, polyline: false } }
	angular.extend( $scope.newCampaign.leaflet, leaflet );
}

onGeolocationError = function () {
	console.log('sup onGeolocationError')
	// angular.extend( $scope.newCampaign.leaflet, config.defaultMap );
}

buildCategories = function () {
	Api.category
	.getCategories( {} )
	.then( function ( response ) {
		$scope.flow.categories = response.objects;
		console.log( $scope.flow.categories );
	} );
}

buildBoundariesMap = function () {
	geo.getLocation( { timeout:10000 } )
	.then( onGeolocationError, onGeolocationError );

	angular.extend( $scope.newCampaign.leaflet, config.defaultMap );
	angular.extend( $scope.newCampaign.leaflet, { controls : { custom: [drawControl] } });

	$scope.newCampaign.boundary;

	leafletData.getMap("leafletNewCampaign").then( function ( map ) {
		map.on('draw:created', function ( e ) {
			var layer = e.layer;
			console.log( JSON.stringify( layer.toGeoJSON() ) );
			$scope.newCampaign.boundary = layer.toGeoJSON().geometry;
			drawnItems.addLayer( layer );
			map.addLayer( layer );
			angular.element('div.leaflet-draw-toolbar-top').hide();
		});
		map.on('draw:deleted', function ( e ) {
			var layer = e.layers._layers[ Object.keys( e.layers._layers )[0] ];
			console.log( 'draw:deleted', e.layers._layers );
			map.removeLayer( layer );
			angular.element('div.leaflet-draw-toolbar-top').show();
		});
	});
}

$scope.flow.hashtagify = function ( name ) {
	var hashtag = [];
	name.split(' ').map( function (v) { hashtag.push( v.charAt(0).toUpperCase() + v.slice(1) ) } );
	return '#' + hashtag.join('');
}

$scope.flow.addTag = function () {
	$scope.newCampaign.nextTag && $scope.newCampaign.tags.push( { title: $scope.newCampaign.nextTag, tag: $scope.flow.hashtagify( $scope.newCampaign.nextTag ) } );
	$scope.newCampaign.nextTag = '';
}

$scope.flow.arrowUp = function ( idx ) {
	var temp;
	if ( idx > 0 ) {
		temp = $scope.newCampaign.tags[ idx - 1 ];
		$scope.newCampaign.tags[ idx - 1 ] = $scope.newCampaign.tags[ idx ];
		$scope.newCampaign.tags[ idx ]     = temp;
	}
}

$scope.flow.arrowDown = function ( idx ) {
	var temp;
	if ( idx < $scope.newCampaign.tags.length - 1 ) {
		temp = $scope.newCampaign.tags[ idx + 1 ];
		$scope.newCampaign.tags[ idx + 1 ] = $scope.newCampaign.tags[ idx ];
		$scope.newCampaign.tags[ idx ]     = temp;
	}
}

$scope.flow.removeTag = function ( idx ) {
	$scope.newCampaign.tags.splice( idx, 1 );
}

// Date picker
$scope.flow.today = function() {
	$scope.flow.dt = new Date();
};
// $scope.flow.today();

$scope.flow.minDate = null;

$scope.flow.dateOptions = {
	'year-format': "'yy'",
	'starting-day': 1
};

$scope.newCampaign.tags = [
{ title: 'Autos Mal Estacionados', tag: '#AutosMalEstacionados' }
]

$scope.newCampaign.save = function () {
	var campaign = {};

	campaign.name                = $scope.newCampaign.title;
	campaign.published           = 1;
	campaign.end_date            = $scope.flow.dt && $scope.flow.dt;
	campaign.short_description   = $scope.newCampaign.mission.substring(0,140) || 'no description';
	campaign.mission             = $scope.newCampaign.mission.substring(0,500) || 'no mission';
	campaign.information_destiny = $scope.newCampaign.information_destiny;
	campaign.category            = $scope.flow.selectedCategory;
	campaign.main_tag            = { tag: $scope.newCampaign.main_hashtag };
	campaign.secondary_tags      = $scope.newCampaign.tags;
	campaign.center              = { type: 'Point', coordinates: [ -77.027772, -12.121937 ] };
	campaign.boundary            = $scope.newCampaign.boundary;

	leafletData.getMap("leafletNewCampaign").then( function ( map ) {
		campaign.center = map.getCenter();
		console.log( 'getcenter', campaign.center );
	}, function ( reason ) {
		console.log( reason );
	} );

	console.log( 'newCampaign', campaign );

	Api.campaign
	.postCampaign( campaign )
	.then( function ( response ) {
		console.log( response );
		console.log( 'postCampaign' );
	}, function ( reason ) {
		console.log( 'postCampaign reason: ', reason );
	} )
}

buildCategories();
buildBoundariesMap();

} ] );
