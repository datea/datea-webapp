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
, 'geoJSONStyle'
, 'localStorageService'
, '$translate'
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
, geoJSONStyle
, localStorageService
, $translate
// , leafletEvents
) {
	var headers
	  , dateo           = {}
	  , alertIndexes    = {}
	  , boundary
	  , defaultMap
	  , addressCache    = {}
	  , drillDownTags   = {}
	  , doDrillDownTags = false
	  // fn declarations
	  , buildBoundary
	  , buildLayerFiles
	  , initMedia
	  , followNewDateo
	  , onGeolocation
	  , onGeolocationError
	  , geocode
	  , reverseGeocode
	  , mapToAddress
	  , positionChanged  = false
	  , hashtagify
	  , markerAnimInterval
	  , markerIcon
	  , ipCountry = User.data.ip_country
	;

var iconHtml = config.visualization.defaultMarkerIcon.htmlGen($location.absUrl());
markerIcon = angular.extend({}, config.visualization.defaultMarkerIcon);
markerIcon.html = iconHtml;

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
$scope.datear.mode          = $scope.dateo.id ? 'edit' : 'new';
$scope.datear.showFileInput = false;
$scope.alerts               = [];
$scope.datear.step			= 1;

if ($scope.datear.mode == 'new' || !$scope.dateo.position) {
	markerIcon.className = 'datea-pin-icon pin-icon-not-set';
}

var $modal_body = $('#modal-body');
if ($modal_body.size() && $modal_body.scrollTop() != 0 ) $modal_body.scrollTo(0,0);

$http({
	  method : 'GET'
	, url    : config.api.url + 'ip_location'
}).success(function (data, status){
	ipCountry = data.ip_country;
}); 

onGeolocation = function ( data ) {
	var leaflet, pipResult, boundaryBounds;

	leaflet = { center : { lat  : data.coords.latitude
	                     , lng  : data.coords.longitude
	                     , zoom : 14
	                     }
		          , markers : { draggy : { lat : data.coords.latitude
		                                 , lng : data.coords.longitude
		                                 , draggable : true
		                                 , icon      : markerIcon
		                                 }
		                      }
		          , events : 'dragend'
		        };

	if (!boundary) {
		angular.extend( $scope.datear.leaflet, leaflet );
	}else{
		
		pipResult = leafletPip.pointInLayer([data.coords.latitude, data.coords.longitude], boundary);
		if (pipResult.length === 0) {
			// check if polygon is in map bounds, otherwise adjust viewport
			boundaryBounds = boundary.getBounds();
			leafletData.getMap("leafletDatear")
			.then( function ( map ) {
				var mcenter;
				map.fitBounds(boundaryBounds);
				if (map.getZoom() < 14) map.zoomIn(1);
				mcenter = map.getCenter();
				if (!$scope.dateo.position) {
					leaflet = {
						  markers : {	draggy : { lat : mcenter.lat
		                               , lng : mcenter.lng
		                               , draggable : true
		                               , icon      : markerIcon
		                               }
						  }
						, events : 'dragend'	
					}
					angular.extend( $scope.datear.leaflet, leaflet );
				}
			} );
		}else{
			// TODO CHECK BOUNDS BECAUSE OF ZOOM
			angular.extend( $scope.datear.leaflet, leaflet );
		}
	}
}

onGeolocationError = function ( reason ) {
	var leaflet = {}
	  , draggy
	  , pipResult
	  , boundaryBounds;
	  ;
	
	// TRY IP LOCATION
	Api.ipLocation.getLocationByIP()
	.then(function (response) {
		leaflet = { center : { lat  : response.ip_location.latitude
                     		 , lng  : response.ip_location.longitude
                     		 , zoom : 14
                     		 }
          		, markers : { draggy : { lat  : response.ip_location.latitude
                     		 						 , lng  : response.ip_location.longitude
                                 		 , draggable : true
                                 		 , icon      : config.visualization.defaultMarkerIcon
                                 		 }
                      		}
          		//, events : 'dragend'
          		}
		if (!boundary) {
	  	angular.extend( $scope.datear.leaflet, leaflet );
		}else{
			pipResult = leafletPip.pointInLayer([response.ip_location.latitude, response.ip_location.longitude], boundary);
			boundaryBounds = boundary.getBounds();
			if (pipResult.length === 0) {
				leafletData.getMap("leafletDatear")
				.then( function ( map ) {
					var mcenter;
					map.fitBounds(boundaryBounds);
					if (map.getZoom() < 14) map.zoomIn(1);
					mcenter = map.getCenter();
					leaflet = {
							  markers : {	draggy : { lat : mcenter.lat
			                               , lng : mcenter.lng
			                               , draggable : true
			                               , icon      : config.visualization.defaultMarkerIcon
			                               }
							  }
							//, events : 'dragend'	
						}
						angular.extend( $scope.datear.leaflet, leaflet );
				} );
			}else {
				// TODO CHECK BOUNDS BECAUSE OF ZOOM
				angular.extend( $scope.datear.leaflet, leaflet );
			}
		}

	}, function (reason) {
		if (!boundary) {
			leaflet = { center : { lat  : -12.05
		                     , lng  : -77.06
		                     , zoom : 14
		                     }
		          , markers : { draggy : { lat : -12.05
		                                 , lng : -77.06
		                                 , draggable : true
		                                 , icon      : config.visualization.defaultMarkerIcon
		                                 }
		                      }
		          //, events : 'dragend'
		          }
		  angular.extend( $scope.datear.leaflet, leaflet );
		}else{
			boundaryBounds = boundary.getBounds();
			leafletData.getMap("leafletDatear")
			.then( function ( map ) {
				map.fitBounds(boundaryBounds);
				mcenter = map.getCenter();
				leaflet = {
						  markers : {	draggy : { lat : mcenter.lat
		                               , lng : mcenter.lng
		                               , draggable : true
		                               , icon      : config.visualization.defaultMarkerIcon
		                               }
						  }
						//, events : 'dragend'	
					}
			});
		}
	});
}

$scope.$on( 'leafletDirectiveMap.click', function ( event, args ) {
	var leafEvent = args.leafletEvent
	  , newDraggy = {}
	  ;

	//$('.pin-icon-not-set').removeClass('pin-icon-not-set');
	positionChanged = true;

	markerIcon.className = 'datea-pin-icon';

	newDraggy = { lat : leafEvent.latlng.lat
	            , lng : leafEvent.latlng.lng
	            , draggable : true
	            , icon      : markerIcon
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
			if (boundary) {
				if (leafletPip.pointInLayer(leafEvent.latlng, boundary).length === 0) {
					$translate('DATEAR.OUT_OF_ZONE')
					.then(function (msg) {
						L.popup({
							offset: L.point(0, -30)
						})
	    			.setLatLng(leafEvent.latlng)
	    			.setContent(msg)
	    			.openOn(map);
					})
				}
			}
	} );

	

	//reverseGeocode(leafEvent.latlng.lat, leafEvent.latlng.lng);

} );

$scope.$on( 'leafletDirectiveMarker.dragstart', function ( event, args ) {
	$('.pin-icon-not-set').removeClass('pin-icon-not-set');
});

$scope.$on( 'leafletDirectiveMarker.dragend', function ( event, args ) {
	var center = args.leafletEvent.target.getLatLng();
	markerIcon.className = 'datea-pin-icon';
	positionChanged = true;
	$scope.datear.leaflet.center.lat  = $scope.datear.leaflet.markers.draggy.lat = center.lat;
	$scope.datear.leaflet.center.lng  = $scope.datear.leaflet.markers.draggy.lng = center.lng;
	if ($scope.datear.leaflet.center.zoom <= 16 ) $scope.datear.leaflet.center.zoom++;
	if (boundary) {
		var ll = L.latLng([$scope.datear.leaflet.markers.draggy.lat, $scope.datear.leaflet.markers.draggy.lng]);
		if (leafletPip.pointInLayer(ll, boundary).length === 0) {
			$translate('DATEAR.OUT_OF_ZONE')
			.then(function (msg) {
				leafletData.getMap("leafletDatear")
				.then( function ( map ) {
					L.popup({
						offset: L.point(0, -30)
					})
					.setLatLng([$scope.datear.leaflet.markers.draggy.lat, $scope.datear.leaflet.markers.draggy.lng])
					.setContent(msg)
					.openOn(map);
				} );
			})
		}
	}
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
	  dateoDate   : $scope.dateo.date ? moment($scope.dateo.date).toDate() : null
	, dateOptions : {
			  'year-format': "'yy'"
			, 'starting-day': 1
		}
	, format      : 'yyyy/MM/dd'
	, opened      : false
	// Time picker
	, dateoTime   : $scope.dateo.date ? moment($scope.dateo.date).toDate() : new Date()
	, hstep       : 1
	, mstep       : 1
}

$scope.flow.dp.openDatepicker = function($event) {
	$event.stopPropagation();
	$event.preventDefault();
	$scope.flow.dp.opened = true;
}
$scope.flow.dp.changed = function () {
	var datetime 
	  , localDate;
	if ($scope.flow.dp.dateoDate) {

		datetime = moment($scope.flow.dp.dateoDate);
		datetime.hour($scope.flow.dp.dateoTime ? $scope.flow.dp.dateoTime.getHours() : 0);
		datetime.minutes($scope.flow.dp.dateoTime ? $scope.flow.dp.dateoTime.getMinutes() : 0);
		datetime.utc();
		$scope.dateo.date = datetime.format();
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
	
	console.log("do datear token", localStorageService.get('token'));

	// Tags
	$scope.dateo.tags = $scope.datear.selectedTags;

	// Position
	if (positionChanged) {
		$scope.dateo.position = { coordinates : [ $scope.datear.leaflet.markers.draggy.lng, $scope.datear.leaflet.markers.draggy.lat ]
	  	                      , type : 'Point'
	    	                    }
	}

	// Media (except link)
	$scope.dateo.images = [];
	$scope.dateo.files  = [];
	angular.forEach($scope.datear.selectedMedia, function (item) {
		var media;
		switch (item.type) {
			case 'image':
				if (item.imgData.id) {
					media = item.imgData;
				}else{
					media = { image : { name     : item.imgData.name
						  							, data_uri : item.img }
									, order : item.order 
								  };
				}
				$scope.dateo.images.push(media);
				break;

			case 'file':
				if (item.fileData.id) {
					item.fileData.title = item.fileTitle;
					media = item.fileData;
				}else{
					media = { file  : { name     : item.fileData.name
						  						  , data_uri : item.file }
						  		, title : item.fileTitle || item.fileData.name
									, order : item.order 
								  };
				}
				$scope.dateo.files.push(media);
				break;
		}
	});

	// Link 
	if ($scope.dateo.link === null) {
		$scope.dateo.link = undefined;
	}

	if ( $scope.dateo.content && $scope.dateo.tags.length ) {
		$scope.datear.loading = true;
		if (!$scope.dateo.id) {
			Api.dateo.postDateo( $scope.dateo )
			.then( function ( response ) {
				$scope.datear.errorMessage = null;
				$scope.datear.onFinished  = true;
				angular.extend($scope.dateo, response);
				$rootScope.$broadcast( 'user:hasDateado' , {dateo: response, created: true});
				$scope.datear.loading = false;
				followNewDateo();
				User.data.dateo_count++;
				User.writeDataToStorage();
			} , function ( reason ) {
				console.log( reason );
				$translate('DATEAR.ERROR.UNKNOWN').then(function (msg) {
					$scope.addAlert({type: 'danger', 'msg': msg});
				});
				$scope.datear.loading = false;
			} );
		}else {
			Api.dateo.patch( $scope.dateo )
			.then( function ( response ) {
				$scope.datear.errorMessage = null;
				//$scope.datear.onFinished  = true;
				angular.extend($scope.dateo, response);
				$rootScope.$broadcast( 'user:hasDateado' , {dateo: response, created: false});
				$scope.datear.loading = false;
				$modalInstance.dismiss('cancel');
			} , function ( reason ) {
				console.log( reason );
				$translate('DATEAR.ERROR.UNKNOWN').then(function (msg) {
					$scope.addAlert({type: 'danger', 'msg': msg});
				});
				$scope.datear.loading = false;
			} );
		}
	} else {
		if ( !$scope.dateo.content ) {
			$translate('DATEAR.ERROR.NO_CONTENT').then(function (msg) {
				$scope.addAlert({type: 'danger', 'msg': msg});
			});
			$scope.flow.validateContent = false;
			$('#modal-body').scrollTo(0,0);
		} else if ( !$scope.dateo.tags.length ) {
			$translate('DATEAR.ERROR.NO_TAG').then(function (msg) {
				$scope.addAlert({type: 'danger', 'msg': msg});
			});
		} else {
			$translate('DATEAR.ERROR.UNKNOWN').then(function (msg) {
				$scope.addAlert({type: 'danger', 'msg': msg});
			});
		}
	}
};


$scope.datear.delete = function () {
	$translate('DATEAR.DELETE_CONFIRM_MSG', function (msg) {
		var amSure = window.confirm(msg);
		if (amSure) {
			$scope.datear.loading = true;
			Api.dateo.delete({id: $scope.dateo.id})
			.then(function (response) {
					$scope.datear.loading = false;
					$modalInstance.dismiss('cancel');
					$rootScope.$broadcast( 'user:dateoDelete', {id: $scope.dateo.id});
					User.data.dateo_count--;
					User.writeDataToStorage();
			}, function (reason) {
				console.log(reason);
			});
		}
	});
};


followNewDateo = function () {
	Api.follow
	.doFollow( { follow_key: 'dateo.'+$scope.dateo.id} )
	.then( function ( response ) {
	}, function ( reason ) {
		console.log( reason );
	} );
};

$scope.datear.cancel = function () {
	$modalInstance.dismiss('cancel');
};

$scope.datear.autocompleteTag = function ( val ) {
	return Api.tag.getAutocompleteByKeyword( { q: val.replace('#', '') } )
	.then( function ( response ) {
		var tags = [];
		angular.forEach( response.suggestions, function( item ){
			tags.push( item );
		});
		return tags;
	} );
};

hashtagify = function ( name ) {
	var hashtag = name.split(' ');
	hashtag = hashtag.map( function (w) {
		w = w.replace(/[^a-z0-9]/gi,'');
		return w.charAt(0).toUpperCase() + w.slice(1); 
	});
	return hashtag.join('');
};

$scope.datear.addTag = function ( tag ) {
	var dtag, moreTags;

	$scope.datear.nextTag = null;
	if ( !~$scope.datear.selectedTags.indexOf( tag )
	&& $scope.datear.selectedTags.length < config.dateo.tagsMax ) {
		tag = hashtagify(tag);
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
			$scope.datear.selectedMedia.push({type: 'link', order: 0});
		}
		if ($scope.dateo.images && $scope.dateo.images.length) {
			angular.forEach($scope.dateo.images, function (img) {
				var path = img.image.split('/')
				img.name = path[path.length -1];
				$scope.datear.selectedMedia.push({
					  type    : 'image'
					, img     :  config.api.imgUrl+img.image
					, imgData : img
					, order   : img.order
				});
			});		
		}
		if ($scope.dateo.files && $scope.dateo.files.length) {
			angular.forEach($scope.dateo.files, function (file) {
				var path = file.file.split('/')
				file.name = path[path.length -1];
				$scope.datear.selectedMedia.push({
					  type      : 'file'
					, file      : file.file
					, fileData  : file
					, fileTitle : file.title
					, order     : file.order
				});
			});
		}
	}
}

$scope.datear.toggleFileInput = function(fileType) {
	if (!$scope.datear.showFileInput || !$scope.datear.activeFileInputType || $scope.datear.activeFileInputType === fileType) {
		$scope.datear.showFileInput = !$scope.datear.showFileInput;
	}
	$scope.datear.activeFileInputType = fileType;
}

$scope.datear.fileInputCallback = function (files) {
	$scope.$apply(function () {
		$scope.datear.showFileInput = false;
		for (var f in files) {
			if ($scope.datear.selectedMedia.length < 10) {
				var file = files[f];
				if (file.type === 'image') {
					var orderIdx = $scope.datear.selectedMedia.filter(function(m){return m.type === 'image'}).length;
					$scope.datear.selectedMedia.push({
						  type    : 'image'
						, img     : file.file
						, imgData : file.data
						, order   : orderIdx
					});
				}else if (file.type === 'file') {
					var orderIdx = $scope.datear.selectedMedia.filter(function(m){return m.type === 'file'}).length;
					$scope.datear.selectedMedia.push({
						  type     : 'file'
						, file     : file.file
						, fileData : file.data
						, order    : orderIdx
					});
				}
			}
		}
	});
}

$scope.datear.removeMedia = function (idx) {

	var mediaType = $scope.datear.selectedMedia[idx].type;
	$scope.datear.selectedMedia.splice(idx, 1);

	if (mediaType === 'link') {
		$scope.dateo.link = null;
	}
}

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
			//$scope.dateo.link.url = '';
			$translate('DATEAR.ERROR.URL_LOAD').then(function (msg) {
				$scope.datear.link.urlPH = msg;
			});
			$scope.datear.link.loading = false;
		});
	}else {
		//$scope.dateo.link.url = '';
		$translate('DATEAR.ERROR.URL_FORMAT').then(function (msg) {
				$scope.datear.link.urlPH = msg;
		});
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

buildBoundary = function () {
	var latLngs = []
		, polygonBounds
	;
	
	if (datearModalGivens.boundary && datearModalGivens.boundary.coordinates) {

		boundary = L.geoJson(datearModalGivens.boundary, {
			style : {
					color   : '#E65F00'
				, fill    : false
				, weight  : 4
			}
		});

		leafletData.getMap("leafletDatear")
		.then( function ( map ) {
			map.addLayer(boundary);
		} );
	}
}

buildLayerFiles = function () {
	if (datearModalGivens.layerFiles && datearModalGivens.layerFiles.length > 0) {
		leafletData.getMap("leafletDatear")
		.then( function ( map ) {
			angular.forEach(datearModalGivens.layerFiles, function (lf) {
				var fname, ext;
				fname = lf.file.split('/').slice(-1)[0];
				ext   = fname.split('.').slice(-1)[0].toLowerCase();
				if (ext === 'kml') {
					$http.get(config.api.imgUrl+lf.file)
					.success( function (data) {
						L.geoJson(gjson, geoJSONStyle).addTo(map);
					} );
				}else if (ext === 'json') {
					$http.get(config.api.imgUrl+lf.file)
					.success( function (data) {
						L.geoJson(data, geoJSONStyle).addTo(map);
					} );
				}
			} );
		} );
	}
}

// Map defaults
defaultMap = angular.copy( config.defaultMap );
defaultMap.markers = { draggy : { lat : -12.05
	                              , lng : -77.06
	                              , draggable : true
	                              , icon : config.visualization.defaultMarkerIcon
	                              } };
angular.extend( $scope.datear.leaflet, defaultMap );

if ( datearModalGivens.defaultTag ) {
	$scope.datear.selectedTags.push( datearModalGivens.defaultTag );
}
if ($scope.dateo.tags && $scope.dateo.tags.length) {
	$scope.datear.selectedTags = $scope.dateo.tags.map(function(t){
		if (typeof(t) == 'string') return t;
		return t.tag;
	});
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
buildBoundary();
buildLayerFiles();

} ] );
