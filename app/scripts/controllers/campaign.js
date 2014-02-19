'use strict';

angular.module('dateaWebApp')
.controller( 'CampaignCtrl'
, [ '$scope'
  , 'Api'
  , '$routeParams'
  , 'config'
, function (
    $scope
  , Api
  , $routeParams
  , config
) {

	var sessionMarkersIdx = 0
	  // fn declarations
	  , buildCampaign
	  , buildDateos
	  , buildMarkers
	  , getTagsString
	  ;

	$scope.campaign         = {};
	$scope.campaign.leaflet = {};
	$scope.campaign.dateos  = {};

	buildMarkers = function ( givens ) {
		var dateos  = givens && givens.dateos
		  , markers = {}
		  , center  = {}
		  ;

		angular.forEach( dateos, function ( value, key ) {
			// if ( value.position ) {
				markers['marker'+sessionMarkersIdx] = {
				  lat       : value.position.coordinates[1]
				, lng       : value.position.coordinates[0]
				, message   : value.extract
				, draggable : false
				, focus     : false
				, _id       : value.id
				};
				sessionMarkersIdx += 1;
			// }
		} );
		center.lat  = markers.marker0.lat;
		center.lng  = markers.marker0.lng;
		center.zoom = config.campaign.mapZoomFocus;
		angular.extend( $scope.campaign.leaflet.markers, markers );
		angular.extend( $scope.campaign.leaflet.center, center );
		$scope.campaign.leaflet.markers.marker0.focus = true;
	}

	buildCampaign = function () {
		var campaignGivens = {};

		campaignGivens.user     = $routeParams.username;
		campaignGivens.main_tag = $routeParams.campaignName;

		Api.campaign
		.getCampaigns( campaignGivens )
		.then( function ( response ) {
			angular.extend( $scope.campaign , response.objects[0] );
			buildDateos();
		}, function ( reason ) {
			console.log( reason );
		} );
	}

	getTagsString = function ( givens ) {
		var mainTag       = givens.main_tag
		  , secondaryTags = givens.secondary_tags
		  , secondaryTagsArray = []
		  ;
		angular.forEach( secondaryTags, function ( value, key ) {
			!!value.tag && secondaryTagsArray.push( value.tag );
		});
		return !secondaryTags.length ? mainTag.tag : mainTag.tag + ',' + secondaryTagsArray.join(',');
	}

	buildDateos = function () {
		var dateoGivens = {}
		  , dateos = []
		  ;
		dateoGivens.tags = getTagsString( $scope.campaign );
		if ( $scope.campaign ) {
			Api.dateo
			.getDateos( dateoGivens )
			.then( function ( response ) {
				angular.forEach( response.objects, function ( value, key ){
					if ( value.position ) {
						dateos.push( value );
					}
				});
				$scope.campaign.dateos = dateos;
				buildMarkers( { dateos : dateos } );
			}, function ( reason ) {
				console.log( reason );
			} );
		}
	}

	$scope.campaign.focusDateo = function ( idx ) {
		var markerName
		  , center = {}
		  ;
		markerName  = 'marker'+idx;
		console.log( 'focusDateo', idx, $scope.campaign.leaflet.markers );
		center.lat  = $scope.campaign.leaflet.markers[markerName].lat;
		center.lng  = $scope.campaign.leaflet.markers[markerName].lng;
		center.zoom = config.campaign.mapZoomFocus;
		angular.extend( $scope.campaign.leaflet.center, center );
		$scope.campaign.leaflet.markers[markerName] &&
		( $scope.campaign.leaflet.markers[markerName].focus = true );
	}

	if ( $routeParams.username && $routeParams.campaignName ) {
		buildCampaign();
		angular.extend( $scope.campaign.leaflet, config.defaultMap );
	}

} ] );
