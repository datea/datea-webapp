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
, function (
  $scope
, $modalInstance
, geo
, $http
, $rootScope
, config
, Api
) {
	var headers
	  , dateo = {}
	  , alertIndexes = {}
	  // fn declarations
	  , onGeolocation
	  , onGeolocationError
	  ;

// Object to be sent
$scope.dateo  = {};
$scope.datear = {};
$scope.datear.autocomplete = {};
$scope.flow   = {};

$scope.alerts = [];

onGeolocation = function ( data ) {
	var leaflet;
	leaflet = { center : { lat  : data.coords.latitude
	                     , lng  : data.coords.longitude
	                     , zoom : 10
	                     }
	          , markers : { draggy : { lat : data.coords.latitude
	                                 , lng : data.coords.longitude
	                                 , draggable : true
	                                 }
	                      }
	          }

	angular.extend( $scope, leaflet );
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

	angular.extend( $scope, leaflet );
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


$scope.datear.ok = function () {
	var tags = [];
	$scope.dateo.position = { coordinates : [ $scope.markers.draggy.lng, $scope.markers.draggy.lat ]
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

$scope.datear.selectedTags = [];
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
angular.extend( $scope, config.defaultMap );

geo.getLocation( {timeout:10000} ).then( onGeolocation, onGeolocationError );

} ] );
