'use strict';

angular.module('dateaWebApp')
.controller('DatearCtrl',
[ '$scope'
, '$modalInstance'
, 'geolocation'
, '$http'
, '$rootScope'
, 'config'
, 'Api'
, 'datearModalGivens'
// , 'leafletEvents'
, function (
  $scope
, $modalInstance
, geo
, $http
, $rootScope
, config
, Api
, datearModalGivens
// , leafletEvents
) {
	var headers
	  , dateo        = {}
	  , alertIndexes = {}
	  // fn declarations
	  , onGeolocation
	  , onGeolocationError
	  ;

// Object to be sent
$scope.dateo               = {};
$scope.datear              = {};
$scope.datear.leaflet      = {};
$scope.datear.autocomplete = {};
$scope.flow                = {};

$scope.datear.selectedTags = [];
$scope.alerts = [];

$scope.$on( 'leafletDirectiveMarker.dragend', function ( event ){
	if ( $scope.datear.leaflet.center.zoom <= 16 ) {
		$scope.datear.leaflet.center.lat  = $scope.datear.leaflet.markers.draggy.lat;
		$scope.datear.leaflet.center.lng  = $scope.datear.leaflet.markers.draggy.lng;
		$scope.datear.leaflet.center.zoom = $scope.datear.leaflet.center.zoom + 1;
	}
} );

onGeolocation = function ( data ) {
	var leaflet;
	leaflet = { center : { lat  : data.coords.latitude
	                     , lng  : data.coords.longitude
	                     , zoom : 14
	                     }
	          , markers : { draggy : { lat : data.coords.latitude
	                                 , lng : data.coords.longitude
	                                 , draggable : true
	                                 }
	                      }
	          , events : 'dragend'
	          }

	angular.extend( $scope.datear.leaflet, leaflet );
}

onGeolocationError = function ( reason ) {
	var leaflet = {}
	  , draggy
	  ;
	// default center
	draggy = { lat: -12.05
	         , lng: -77.06
	         , draggable: true
	         }
	leaflet.markers = {};
	leaflet.markers.draggy = draggy;

	angular.extend( $scope.datear.leaflet, leaflet );
}

$scope.closeAlert = function ( index ) {
	$scope.alerts.splice(index, 1);
}

$scope.addAlert = function ( givens ) {
	return $scope.alerts.push( givens ) - 1;
}

$rootScope.$on( 'dateo:imgLoaded', function ( ev, givens ) {
	if ( givens.data.size > config.dateo.sizeImgMax ) {
		$scope.dateo.img = null;
		alertIndexes.imgSize !== void 0 && $scope.closeAlert( alertIndexes.imgSize );
		alertIndexes.imgSize = $scope.addAlert( { type: 'danger', msg: config.dateo.sizeImgMaxMsg } );
	} else {
		alertIndexes.imgSize !== void 0 && $scope.closeAlert( alertIndexes.imgSize );
	}
} );

// Date picker
$scope.flow.today = function() {
	$scope.flow.dt = new Date();
};
$scope.flow.today();

$scope.flow.minDate = null;

$scope.flow.dateOptions = {
	'year-format': "'yy'",
	'starting-day': 1
};

// Time picker
$scope.flow.timeNow = new Date();

$scope.flow.hstep = 1;
$scope.flow.mstep = 1;

// Datetime sum
$scope.$watch( 'flow.dt + flow.timeNow', function () {
	var datetime = {}
	if ( $scope.flow.dt && $scope.flow.timeNow ) {
		datetime.year     = $scope.flow.dt.getUTCFullYear();
		datetime.month    = $scope.flow.dt.getUTCMonth();
		datetime.day      = $scope.flow.dt.getDate();
		datetime.hour     = $scope.flow.timeNow.getHours();
		datetime.minutes  = $scope.flow.timeNow.getUTCMinutes();
		$scope.dateo.date = new Date( datetime.year
		, datetime.month
		, datetime.day
		, datetime.hour
		, datetime.minutes
		, '00' );
		console.log( 'datetime', $scope.dateo.date );
	}
} );

// /* Static alert close */
// $scope.closeAlert = function ( ev ) {
// 	var $this = angular.element( ev.srcElement );

// 	$this.parent().remove();
// }


$scope.datear.doDatear = function () {
	var tags = [];
	$scope.dateo.position = { coordinates : [ $scope.datear.leaflet.markers.draggy.lng, $scope.datear.leaflet.markers.draggy.lat ]
	                        , type : 'Point'
	                        }
	angular.forEach( $scope.datear.selectedTags, function ( value, key ){
		tags.push( { 'tag' : value } );
	});
	$scope.dateo.tags = tags;
	$scope.dateo.images = [ { image : { name     : $scope.datear.imgData.name
	                                  , data_uri : $scope.datear.img
	                                  }
	                        , order : 0
	                        }
	                      ];
	// Some validation and then
	Api.dateo.postDateo( $scope.dateo )
	.then( function ( response ) {
		$scope.datear.onFinished = true;
		$rootScope.$broadcast( 'user:hasDateado' );
	}
	, function ( reason ) {
		console.log( reason )
	} )
};

$scope.datear.cancel = function () {
	$modalInstance.dismiss('cancel');
};

$scope.datear.autocompleteTag = function ( val ) {
	return Api.tag.getAutocompleteByKeyword( { q: val } )
	.then( function ( response ) {
		var tags = [];
		angular.forEach( response.suggestions, function( item ){
			tags.push( item );
		});
		return tags;
	} );
}

$scope.datear.addTag = function ( tag ) {
	$scope.dateo.nextTag = null;
	if ( !~$scope.datear.selectedTags.indexOf( tag )
	&& $scope.datear.selectedTags.length < config.dateo.tagsMax ) {
		tag = tag.replace('#','');
		$scope.datear.selectedTags.push( tag );
	}
}
$scope.datear.removeTag = function ( idx ) {
	$scope.datear.selectedTags.splice( idx, 1 );
}

// Map defaults
angular.extend( $scope.datear.leaflet, config.defaultMap );
if ( datearModalGivens.defaultTag ) {
	$scope.datear.selectedTags.push( datearModalGivens.defaultTag );
}
if ( datearModalGivens.suggestedTags ) {
	$scope.datear.suggestedTags = datearModalGivens.suggestedTags;
}
geo.getLocation( {timeout:10000} ).then( onGeolocation, onGeolocationError );

} ] );
