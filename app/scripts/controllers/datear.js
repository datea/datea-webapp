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
, 'User'
, '$location'
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
, User
, $location
// , leafletEvents
) {
	var headers
	  , dateo           = {}
	  , alertIndexes    = {}
	  , defaultMap
	  , addressCache    = {}
	  , drillDownTags   = {}
	  , doDrillDownTags = false
	  // fn declarations
	  , initMedia
	  , followNewDateo
	  , onGeolocation
	  , onGeolocationError
	  , geocode
	  , reverseGeocode
	  , mapToAddress
	;

// Object to be sent
$scope.dateo                = datearModalGivens.dateo || {};
$scope.datear               = {};
$scope.datear.leaflet       = {};
$scope.datear.autocomplete  = {};
$scope.datear.link				  = {};
$scope.datear.selectedMedia = [];
$scope.flow                 = {};
$scope.flow.dp              = {};

$scope.datear.selectedTags  = [];
$scope.datear.loading			  = false;
$scope.datear.onFinished    = false;
$scope.datear.isScrolling   = false;
$scope.datear.modalTitle    = $scope.dateo.id ? 'Editar dateo' : '¡Datea!';
$scope.datear.mode          = $scope.dateo.id ? 'edit' : 'new';
$scope.alerts               = [];
$scope.datear.step				  = 1;

var $modal_body = angular.element(document.getElementById('modal-body'));
if ($modal_body.scrollTop() != 0 ) $modal_body.scrollTop(0);

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
console.log( 'onGeolocationError' );
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

	/*
	if ( $scope.datear.leaflet.center.zoom <= 16 ) {
		$scope.datear.leaflet.center.lat  = $scope.datear.leaflet.markers.draggy.lat;
		$scope.datear.leaflet.center.lng  = $scope.datear.leaflet.markers.draggy.lng;
		setTimeout(function () {
			$scope.datear.leaflet.center.zoom = $scope.datear.leaflet.center.zoom + 1;
		}, 300);
	}*/
	leafletData.getMap("leafletDatear")
		.then( function ( map ) {
			var zoom   = $scope.datear.leaflet.center.zoom;
			if (zoom <= 16) {
				var center = L.latLng(leafEvent.latlng.lat, leafEvent.latlng.lng); 
			 	zoom+=2;
				map.setZoomAround(center, zoom);
				angular.extend( $scope.datear.leaflet.markers.draggy, newDraggy );
			} else {
				angular.extend( $scope.datear.leaflet.markers.draggy, newDraggy );
			} 
	} );

	

	//reverseGeocode(leafEvent.latlng.lat, leafEvent.latlng.lng);

} );


$scope.scrollTo = function($event, element, offset) {
	var rootElem, elem;
	$event.stopPropagation();
	$event.preventDefault();
	$scope.datear.isScrolling = true;
	rootElem = angular.element(document.getElementById('modal-body'));
	elem = angular.element(document.getElementById(element));
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

$rootScope.$on( 'datea:fileLoaded', function ( ev, givens ) {
	if ( givens.data.size > config.dateo.sizeImgMax ) {
		$scope.datear.img = null;
		alertIndexes.imgSize !== void 0 && $scope.closeAlert( alertIndexes.imgSize );
		alertIndexes.imgSize = $scope.addAlert( { type: 'danger', msg: config.dateo.sizeImgMaxMsg } );
	} else {
		alertIndexes.imgSize !== void 0 && $scope.closeAlert( alertIndexes.imgSize );
	}
} );

$rootScope.$on('duScrollspy:becameActive', function($event, $element){
	var spy = $element[0].attributes['du-scrollspy'].value;
	var step = parseInt(spy.charAt(spy.length-1));
	$scope.$apply(function() {$scope.datear.step = step});
	/*
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
	}*/
});

// DATE INPUT
$scope.flow.dp = {
	// Date picker
	  dateoDate   : $scope.dateo.date ? Date.parse($scope.dateo.date) : null
	, dateOptions : {
			  'year-format': "'yy'"
			, 'starting-day': 1
		}
	, format      : 'yyyy/MM/dd'
	, opened      : false
	// Time picker
	, dateoTime   : $scope.dateo.date ? Date.parse($scope.dateo.date) : new Date()
	, hstep       : 1
	, mstep       : 1
}

$scope.flow.dp.openDatepicker = function($event) {
	$event.stopPropagation();
	$event.preventDefault();
	$scope.flow.dp.opened = true;
}
$scope.flow.dp.changed = function () {
	var datetime = {}
		, localDate;
	if ($scope.flow.dp.dateoDate) {
		datetime.year     = $scope.flow.dp.dateoDate.getFullYear();
		datetime.month    = $scope.flow.dp.dateoDate.getMonth();
		datetime.day      = $scope.flow.dp.dateoDate.getDate();
		if ($scope.flow.dp.dateoTime) {
			datetime.hour     = $scope.flow.dp.dateoTime.getHours();
			datetime.minutes  = $scope.flow.dp.dateoTime.getMinutes();
		}else{
			datetime.hour    = 0;
			datetime.minutes = 0;
		}
		localDate = new Date( datetime.year
		, datetime.month
		, datetime.day
		, datetime.hour
		, datetime.minutes
		, '00' );
		$scope.dateo.date = new Date( localDate.getTime() - (localDate.getTimezoneOffset() * 60000));
	}else {
		$scope.dateo.date = null;
	}
}

// Date watch
$scope.$watch( 'flow.dp.dateoDate', function () {
	$scope.flow.dp.changed();
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
		if ($scope.datear.imgData.id) {
			$scope.dateo.images = [$scope.datear.imgData];
		} else {
			$scope.dateo.images = [ { image : { name     : $scope.datear.imgData.name
			                                  , data_uri : $scope.datear.img
			                                  }
			                        , order : 0
			                        }
			                      ];
		}
	}

	// Files
	if ( $scope.datear.fileData) {
		if ($scope.datear.fileData.id) {
			$scope.datear.fileData.title = $scope.datear.fileTitle;
			$scope.dateo.files = [$scope.datear.fileData];
		}else{
			$scope.dateo.files = [ { file   : { name     : $scope.datear.fileData.name
			                                  , data_uri : $scope.datear.file
			                                  }
			                        , title : $scope.datear.fileTitle || $scope.datear.fileData.name
			                        , order : 0
			                        }
			                      ];
		}
	}

	// Link 
	//if ($scope.dateo.link === null) {
	//	$scope.dateo.link = undefined;
	//}

	if ( $scope.dateo.content && $scope.dateo.tags.length ) {
		if (!$scope.dateo.id) {
			Api.dateo.postDateo( $scope.dateo )
			.then( function ( response ) {
				$scope.datear.errorMessage = null;
				$scope.datear.onFinished  = true;
				angular.extend($scope.dateo, response);
				$rootScope.$broadcast( 'user:hasDateado' , {dateo: response, created: true});
				$scope.datear.loading = false;
				followNewDateo();
			} , function ( reason ) {
				console.log( reason );
			} );
		}else {
			Api.dateo.patchList( {objects: [$scope.dateo]} )
			.then( function ( response ) {

				$scope.datear.errorMessage = null;
				//$scope.datear.onFinished  = true;
				angular.extend($scope.dateo, response.objects[0]);
				$rootScope.$broadcast( 'user:hasDateado' , {dateo: response.objects[0], created: false});
				$scope.datear.loading = false;
				$modalInstance.dismiss('cancel');
			} , function ( reason ) {
				console.log( reason );
			} );
		}
	} else {
		if ( !$scope.dateo.content ) {
			$scope.datear.errorMessage = 'Escriba una descripción de su dateo';
		} else if ( !$scope.dateo.tags.length ) {
			$scope.datear.errorMessage = 'Elija una etiqueta';
		} else {
			$scope.datear.errorMessage = 'Hubo un error al datear';
		}
	}
};

followNewDateo = function () {
	Api.follow
	.doFollow( { follow_key: 'dateo.'+$scope.dateo.id} )
	.then( function ( response ) {
		console.log("FOLLOWED NEW DATEO", response);
	}, function ( reason ) {
		console.log( reason );
	} );
}

$scope.datear.cancel = function () {
	$modalInstance.dismiss('cancel');
}

$scope.datear.autocompleteTag = function ( val ) {
	return Api.tag.getAutocompleteByKeyword( { q: val.replace('#', '') } )
	.then( function ( response ) {
		var tags = [];
		angular.forEach( response.suggestions, function( item ){
			tags.push( item );
		});
		return tags;
	} );
}

$scope.datear.addTag = function ( tag ) {
	var dtag, moreTags;

	$scope.datear.nextTag = null;
	if ( !~$scope.datear.selectedTags.indexOf( tag )
	&& $scope.datear.selectedTags.length < config.dateo.tagsMax ) {
		tag = tag.replace('#','');
		$scope.datear.selectedTags.push( tag );
	}
	// drill down to secondary tags contained in campaigns (if tag has campaigns)
	if (doDrillDownTags && !!drillDownTags[tag]) {
		dtag = drillDownTags[tag];
		if (dtag.campaigns.length > 0) {
			moreTags = [];
			for (var i in dtag.campaigns) {
				if (dtag.campaigns[i].secondary_tags && dtag.campaigns[i].secondary_tags.length) {
					moreTags = moreTags.concat(dtag.campaigns[i].secondary_tags.map(function(t){ return {tag: t}}));
				}
			}
			if (moreTags.length) {
				$scope.datear.suggestedTags2 = moreTags;
			}
		}
	}
}
$scope.datear.removeTag = function ( idx ) {
	$scope.datear.selectedTags.splice( idx, 1 );
}

$scope.datear.suggestedTagsBack = function () {
		$scope.datear.suggestedTags2 = null;
}

reverseGeocode = function (lat, lng) {
	if (!$scope.dateo.address || $scope.dateo.address.trim() != '') {
		$http({
			  method : 'GET'
			, url    : 'http://nominatim.openstreetmap.org/reverse'
			, params : {
					lat               : lat
				, lon               : lng
				, format            : 'json'
				, 'accept-language' : 'es,en' 
 			}
		}).success(function (data, status){
			console.log("NOMINATIM REVERSE", data);
			$scope.dateo.address = data.display_name;
		}); 
	}
}

geocode = function (query) {
	$scope.flow.addressSearchLoading = true;
	$http({
		  method : 'GET'
		, url    : 'http://nominatim.openstreetmap.org/search'
		, params : {
				q                 : query
			, format            : 'json'
			, 'accept-language' : 'es,en'
			, countrycodes      : User.data.ip_country
			}
	}).success(function (data, status){
		console.log("NOMINATIM SEARCH", data);
		if (data.length == 1) {
			mapToAddress(data[0]);
		} else if (data.length > 1) {
			$scope.flow.addressSearchResults = data;
		} else {
			$scope.flow.addressNotFound = true;
			setTimeout(function () {
				$scope.$apply(function() {$scope.flow.addressNotFound = false;});
			}, 2000);
		}
		$scope.flow.addressSearchLoading = false;
		addressCache[query] = data;
		$('.address-search-btn').blur();
	}).error(function (data, status) {
		$scope.flow.addressSearchLoading = false;
		$('.address-search-btn').blur();
	}); 
}

mapToAddress = function (address) {
	var newDraggy, lat, lng;
	lat = parseFloat(address.lat);
	lng = parseFloat(address.lon);
	newDraggy = { 
		 			  lat : lat
          , lng : lng
          , draggable : true
          }
  angular.extend( $scope.datear.leaflet.markers.draggy, newDraggy );
  $scope.datear.leaflet.center.lat  = lat;
	$scope.datear.leaflet.center.lng  = lng;
	$scope.datear.leaflet.center.zoom = 16;
	$('.address-search-btn').blur();
}

$scope.flow.searchAddressInMap = function () {
	var query, results;
	$('.address-search-btn').focus();
	if ($scope.dateo.address && $scope.dateo.address.trim() !== '' && !$scope.flow.addressSearchLoading) {
		query = $scope.dateo.address.trim();
		if (addressCache[query]) {
			results = addressCache[query];
			if (results.length > 1) {
				$scope.flow.addressSearchResults = results;
			} else if (results.length == 1) {
				mapToAddress(results[0]);
			} else {
				$scope.flow.addressNotFound = true;
				setTimeout(function () {
					$scope.$apply(function() {$scope.flow.addressNotFound = false;});
				}, 2000);
			}
			$('.address-search-btn').blur();
		}else {
			geocode(query);
		}
	}
}

$scope.flow.selectAddress = function (idx) {
	var address = $scope.flow.addressSearchResults[idx];
	mapToAddress(address);
	$scope.flow.addressSearchResults = null;
}

$scope.flow.closeSelectAddress = function () {
	if (!$scope.flow.mouseOverSelectAddress) {
		$scope.flow.addressSearchResults = null;
	}
	$scope.flow.addressNotFound = false;
}

initMedia = function () {
	if ($scope.dateo.id) {
		if ($scope.dateo.link && $scope.dateo.link.url) {
			$scope.datear.selectedMedia.unshift({type: 'link', order: 0});
		}
		if ($scope.dateo.images && $scope.dateo.images.length) {
			$scope.datear.img = config.api.imgUrl+$scope.dateo.images[0].image;
			$scope.datear.imgData = $scope.dateo.images[0];
			//$scope.datear.selectedMedia.unshift({type: 'image', order: 0});			
		}
		if ($scope.dateo.files && $scope.dateo.files.length) {
			$scope.datear.file = $scope.dateo.files[0].image;
			$scope.datear.fileData = $scope.dateo.files[0];
			$scope.datear.fileTitle = $scope.dateo.files[0].title;
			//$scope.datear.selectedMedia.unshift({type: 'file', order: 0});
		}
	}
}

$scope.datear.removeMedia = function (idx) {

	var mediaType = $scope.datear.selectedMedia[idx].type;
	$scope.datear.selectedMedia.splice(idx, 1);
	switch (mediaType) {
		case 'image':
			$scope.datear.img = null;
			$scope.datear.imgData = null;
			if ($scope.dateo.images && $scope.dateo.images.length) {
				$scope.dateo.images = [];
			}
			break;
		case 'file':
			$scope.datear.file = null;
			$scope.datear.fileData = null;
			if ($scope.dateo.files && $scope.dateo.files.length) {
				$scope.dateo.files = [];
			}
			break;
		case 'link':
			$scope.dateo.link = null;
			break;
	}
}

$scope.$watch('datear.imgData', function () {
	if (!!$scope.datear.imgData) {
		$scope.datear.selectedMedia.unshift({type: 'image', order: 0});
	}
});

$scope.$watch('datear.fileData', function () {
	if (!!$scope.datear.fileData) {
		$scope.datear.selectedMedia.unshift({type: 'file', order: 0});
	}
});

$scope.datear.link.add = function () {
	if (!$scope.dateo.link) {
		$scope.dateo.link = {};
		$scope.datear.selectedMedia.unshift({type: 'link', order: 0});
	}
}
$scope.datear.link.loadUrl = function () {
	if ($scope.dateo.link.url) {
		$scope.datear.link.loading = true;
		$scope.datear.link.urlPH = '';
		$http({
			  method : 'GET'
			, url    : config.api.url + 'url_info/'
			, params : {
					url: $scope.dateo.link.url
			}
		}).success(function (data, status) {
			$scope.dateo.link.title = data.title;
			$scope.dateo.link.description = data.description;
			if (data.images.length) {
				$scope.dateo.link.img_url = data.images[0];
				$scope.datear.link.images = data.images;
				$scope.datear.link.imgIndex = 0;
			}
			$scope.datear.link.loading = false;
		}).error(function (data, status) {
			//console.log("ERROR IN LINK LOOKUP", data);
			$scope.dateo.link.url = '';
			$scope.datear.link.urlPH = 'No se pudo encontrar la dirección. Inténtalo denuevo.';
			$scope.datear.link.loading = false;
		});
	}else {
		$scope.dateo.link.url = '';
		$scope.datear.link.urlPH = 'Dirección con formato inválido. Falta "http.." ?.';
	}
}
$scope.datear.link.prevImg = function () {
	$scope.datear.link.imgIndex--;
	$scope.dateo.link.img_url = $scope.datear.link.images[$scope.datear.link.imgIndex];
}
$scope.datear.link.nextImg = function () {
	$scope.datear.link.imgIndex++;
	$scope.dateo.link.img_url = $scope.datear.link.images[$scope.datear.link.imgIndex];
}

$scope.datear.goToDateo = function() {
	$location.path('/'+$scope.dateo.user.username+'/dateos/'+$scope.dateo.id);
	$modalInstance.dismiss('cancel');
}

// Map defaults
defaultMap = angular.copy( config.defaultMap );
defaultMap.markers = { draggy : { lat : -12.05
	                              , lng : -77.06
	                              , draggable : true
	                              } };
angular.extend( $scope.datear.leaflet, defaultMap );

if ( datearModalGivens.defaultTag ) {
	$scope.datear.selectedTags.push( datearModalGivens.defaultTag );
}
if ($scope.dateo.tags && $scope.dateo.tags.length) {
	$scope.datear.selectedTags = $scope.dateo.tags.map(function(t){return t.tag;});
}

if ( datearModalGivens.suggestedTags ) {
	$scope.datear.suggestedTags = datearModalGivens.suggestedTags;
}else if (!$scope.dateo.tags){
	$scope.datear.suggestedTags = User.data.tags_followed;
	doDrillDownTags = true;
	for (var i in User.data.tags_followed) {
		var t = User.data.tags_followed[i]
		drillDownTags[t.tag] = t; 
	}
}
if (datearModalGivens.campaignId) {
	$scope.dateo.campaign = datearModalGivens.campaignId;
}
if ($scope.dateo.position) {
	var initGeodata = { coords: { 
			latitude  : $scope.dateo.position.coordinates[1]
		, longitude : $scope.dateo.position.coordinates[0]
	}};
	onGeolocation(initGeodata);
}else{
	geo.getLocation( {timeout:10000} ).then( onGeolocation, onGeolocationError );
}

// check if dateo has media (edit mode)
initMedia();


} ] );
