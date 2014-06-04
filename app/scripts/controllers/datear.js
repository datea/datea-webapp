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
, '$timeout'
, 'leafletData'
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
, $timeout
, leafletData
// , leafletEvents
) {
	var headers
	  , dateo        = {}
	  , alertIndexes = {}
	  , defaultMap
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
$scope.datear.loading			 = false;
$scope.datear.onFinished   = false;
$scope.datear.isScrolling  = false;
$scope.alerts = [];

var $modal_body = angular.element(document.getElementById('modal-body'));
if ($modal_body.scrollTop() != 0 ) $modal_body.scrollTop(0);

$scope.datear.step				 = 1;


$scope.$on( 'leafletDirectiveMarker.dragend', function ( event ) {
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

	// leafletData.getMap("leafletDatear")
	// .then( function ( map ) {
	// 	// map.fitBounds( markersBounds );
	// 	angular.extend( map, leaflet );
	// } )

	angular.extend( $scope.datear.leaflet, leaflet );

}

onGeolocationError = function ( reason ) {
	var leaflet = {}
	  , draggy
	  ;

	leaflet = { center : { lat  : -12.05
	                     , lng  : -77.06
	                     , zoom : 14
	                     }
	          , markers : { draggy : { lat : -12.05
	                                 , lng : -77.06
	                                 , draggable : true
	                                 }
	                      }
	          , events : 'dragend'
	          }

	angular.extend( $scope.datear.leaflet, leaflet );
}

$scope.$on( 'leafletDirectiveMap.click', function ( event, args ) {
	console.log( 'leafletDirectiveMap.click' );
	var leafEvent = args.leafletEvent
	  , newDraggy = {}
	  ;

	newDraggy = { lat : leafEvent.latlng.lat
	            , lng : leafEvent.latlng.lng
	            , draggable : true
	            }

	angular.extend( $scope.datear.leaflet.markers.draggy, newDraggy );

	if ( $scope.datear.leaflet.center.zoom <= 16 ) {
		$scope.datear.leaflet.center.zoom = $scope.datear.leaflet.center.zoom + 1;
		$scope.datear.leaflet.center.lat  = $scope.datear.leaflet.markers.draggy.lat;
		$scope.datear.leaflet.center.lng  = $scope.datear.leaflet.markers.draggy.lng;
	}
} );


$scope.scrollTo = function($event, element, offset) {
	$event.stopPropagation();
	$event.preventDefault();
	$scope.datear.isScrolling = true;
	var rootElem = angular.element(document.getElementById('modal-body'));
	var elem = angular.element(document.getElementById(element));
	rootElem.scrollToElement(elem, offset, 400).then(function() {
		$scope.datear.isScrolling = false;
	});
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

$rootScope.$on('duScrollspy:becameActive', function($event, $element){
	var spy = $element[0].attributes['du-scrollspy'].nodeValue;
	var step = parseInt(spy.charAt(spy.length-1));
	$scope.$apply(function() {$scope.datear.step = step});
	var rootElem = angular.element(document.getElementById('modal-body'));
	if (!$scope.datear.isScrolling) {
		if (step == 1) {
			var elem = angular.element(document.getElementById("spy-step1"));
			rootElem.scrollToElement(elem, 30, 400);
		}else if (step == 2) {
			var elem = angular.element(document.getElementById("spy-step2"));
			rootElem.scrollToElement(elem, 20, 400);
		}else if (step == 3) {
			var elem = angular.element(document.getElementById("spy-step3"));
			rootElem.scrollToElement(elem, 100, 400);
		}
	}
});

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

$scope.open_datepicker = function($event) {
	$event.stopPropagation();
	$event.preventDefault();
	$scope.flow.dp_opened = true;
}

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
	
	$scope.datear.loading = true;

	var tags = [];
	// Tags
	angular.forEach( $scope.datear.selectedTags, function ( value, key ){
		tags.push( { 'tag' : value } );
	});
	$scope.dateo.tags = tags;

	// Position
	$scope.dateo.position = { coordinates : [ $scope.datear.leaflet.markers.draggy.lng, $scope.datear.leaflet.markers.draggy.lat ]
	                        , type : 'Point'
	                        }

	// Images
	if ( $scope.datear.imgData ) {
		$scope.dateo.images = [ { image : { name     : $scope.datear.imgData.name
		                                  , data_uri : $scope.datear.img
		                                  }
		                        , order : 0
		                        }
		                      ];
	}

	if ( $scope.dateo.content && $scope.dateo.tags.length ) {
		Api.dateo.postDateo( $scope.dateo )
		.then( function ( response ) {
			$scope.dateo.errorMessage = null;
			$scope.datear.onFinished  = true;
			$rootScope.$broadcast( 'user:hasDateado' );
		} , function ( reason ) {
			console.log( reason );
		} )
	} else {
		if ( !$scope.dateo.content ) {
			$scope.dateo.errorMessage = 'Escriba una descripción de su dateo';
		} else if ( !$scope.dateo.tags.length ) {
			$scope.dateo.errorMessage = 'Elija una etiqueta';
		} else {
			$scope.dateo.errorMessage = 'Hubo un error al datear';
		}
	}
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
defaultMap = angular.copy( config.defaultMap );
angular.extend( $scope.datear.leaflet, defaultMap );
if ( datearModalGivens.defaultTag ) {
	$scope.datear.selectedTags.push( datearModalGivens.defaultTag );
}
if ( datearModalGivens.suggestedTags ) {
	$scope.datear.suggestedTags = datearModalGivens.suggestedTags;
}
geo.getLocation( {timeout:10000} ).then( onGeolocation, onGeolocationError );




} ] );
