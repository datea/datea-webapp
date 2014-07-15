'use strict';

angular.module('dateaWebApp')
.controller( 'TagCtrl'
, [ '$scope'
  , 'Api'
  , '$routeParams'
  , '$location'
  , '$q'
  , 'User'
  , '$modal'
  , 'config'
  , '$filter'
  , '$interpolate'
  , 'leafletData'
  , '$timeout'
  , 'leafletMarkersHelpers'
, function (
    $scope
  , Api
  , $routeParams
  , $location
  , $q
  , User
  , $modal
  , config
  , $filter
  , $interpolate
  , leafletData
  , $timeout
  , leafletMarkersHelpers
) {

	var sessionMarkersIdx = 0
	  , markersBounds     = []
	// fn declarations
	  , isMainTag
	  , isUserFollowing
	  , buildDateos
	  , buildDateosWithImages
	  , buildMarkers
	  , buildMarker
	  , addMarker
	  , buildTag
	  , updateTag
	  , goToMainTag
	  ;

	$scope.tag = {};
	$scope.tag.leaflet = {};

	$scope.tag.isUserSignedIn = User.isSignedIn();

	$scope.tag.selectedMarker = 'last';

	$scope.tag.loading = {};
	$scope.tag.loading.leaflet = true;
	$scope.tag.loading.dateos  = true;

	$scope.flow             = {};
	$scope.flow.notFound    = false;

	isMainTag = function () {
		var dfd = $q.defer();
		Api.campaign
		.getCampaigns( { main_tag: $routeParams.tagName } )
		.then( function ( response ) {
			dfd.resolve( { isMainTag: !!response.objects.length, tagObj: response.objects } );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	buildTag = function () {
		Api.tag
		.getTags( { tag: $routeParams.tagName } )
		.then( function ( response ) {
			if ( response.objects[0] ) {
				angular.extend($scope.tag, response.objects[0]);
				buildDateos();
				buildDateosWithImages();
			} else {
				$scope.flow.notFound = true;
			}
		}, function ( reason ) {
			console.log( reason );
			if ( reason.status === 404 ) {
				$scope.$apply( function () {
					$scope.flow.notFound = true;
				} );
			}
		} );
	}

	updateTag = function () {
		Api.tag
		.getTags( { tag: $routeParams.tagName } )
		.then( function ( response ) {
			angular.extend($scope.tag, response.objects[0]);
		}, function (reason) {
			console.log(reason);
		});
	}

	buildDateos = function ( givens ) {
		var dateoGivens = {}
		  , dateos      = []
		  , q           = givens && givens.q
		  ;
		dateoGivens.tags = $scope.tag.tag;
		dateoGivens.q    = q;
		if( $scope.tag.selectedMarker !== 'last' ) {
			dateoGivens.order_by = config.selectFilter[ $scope.tag.selectedMarker ];
		}
		if ( dateoGivens.tags ) {
			$scope.tag.dateos = [];
			Api.dateo
			.getDateos( dateoGivens )
			.then( function ( response ) {
				if ( response.objects.length ) {
					angular.forEach( response.objects , function ( value, key ) {
						if ( value.position ) {
							dateos.push( value );
						}
					});
					$scope.tag.dateos = dateos;
					buildMarkers( { dateos: dateos } );
					$scope.tag.loading.dateos = false;
				} else {
					$scope.tag.leaflet.markers = {};
					$scope.tag.loading.dateos  = false;
					$scope.tag.loading.leaflet = false;
				}
			}, function ( reason ) {
				console.log( reason );
			} )
		}
	}

	buildDateosWithImages = function () {
		var dateos = [];
		Api.dateo
		.getDateos( { has_images: 1, tags: $scope.tag.tag } )
		.then( function ( response ) {
			angular.forEach( response.objects, function ( value, key ) {
				if ( value.position ) {
					dateos.push( value );
				}
			} );
			$scope.tag.dateosWithImages = dateos;
			$scope.tag.dateosWithImagesHolderHeight = { height : ( Math.ceil( $scope.tag.dateosWithImages.length / 6 ) * 200 ) + 'px' };
		}, function ( reason ) {
			console.log( reason );
		} )
	}

	var markerIcon = {
		  type     		: 'div'
		, iconSize 		: [29, 40]
		, iconAnchor	: [14.5, 40]
		, popupAnchor	: [0, -33]
		, labelAnchor	: [8, -25]
		, html     		: '<svg width="29" height="40"><g style="clip-path: url(#pinpath);">'
					 				+ 	'<rect height="40" width="29" fill="'+config.visualization.default_color+'" />'
					 				+ 	'<circle cx="14.5" cy="14" r="5" fill="white" />'
			 		 				+ '</g></svg>'
	}

	buildMarkers = function ( givens ) {
		var dateos  = givens && givens.dateos
		  , markers = {}
		  , center  = {}
		  ;
		console.log( 'buildMarkers' );
		// Cleaning
		sessionMarkersIdx = 0;
		$scope.tag.leaflet.markers = {};

		angular.forEach( dateos, function ( value, key ) {
			// default image for markers
			addMarker(value);
			markersBounds.push( [ value.position.coordinates[1], value.position.coordinates[0] ] );
		} );
		//center.lat  = markers.marker0.lat;
		//center.lng  = markers.marker0.lng;
		//center.zoom = config.campaign.mapZoomFocus;
		//angular.extend( $scope.tag.leaflet.markers, markers );
		//angular.extend( $scope.tag.leaflet.center, center );
		leafletData.getMap("leafletTag")
		.then( function ( map ) {
			map.fitBounds( markersBounds );
		} );
		$scope.tag.loading.leaflet = false;
	}

	buildMarker = function(dateo) {
			dateo._prettyDate = $filter('date')( dateo.date, 'fullDate' );
			return {
			  lat       : dateo.position.coordinates[1]
			, lng       : dateo.position.coordinates[0]
			, group     : $scope.tag.tag
			, label     : { message: $scope.tag.tag }
			, message   : $interpolate( config.marker )(dateo)
			, draggable : false
			, focus     : false
			, _id       : dateo.id
			, icon 			:  markerIcon
			};
	}

	addMarker = function (dateo) {
		var marker = buildMarker(dateo);
		$scope.tag.leaflet.markers['marker'+sessionMarkersIdx] = marker;
		sessionMarkersIdx ++; 
	}

	$scope.clusterOptions = { 
		//iconCreateFunction: $scope.buildClusterIcon,
		//disableClusteringAtZoom: 17,
		polygonOptions: {
			weight: 1,
			fillColor: "#999",
			color: '#999',
			fillOpacity: 0.4
		}
	};

	goToMainTag = function ( givens ) {
		$location.path( givens.username + '/' + givens.tagName ).replace();
	}

	$scope.tag.isUserFollowing = function () {
		return isUserFollowing();
	}

	$scope.tag.datear = function () {
		if ( $scope.tag.isUserSignedIn  ) {
			$modal.open( { templateUrl : 'views/datear.html'
			             , controller  : 'DatearCtrl'
			             , windowClass : 'datear-modal'
			             , resolve     : {
			                datearModalGivens : function () {
			                   return { 
			                   		defaultTag : $scope.tag.tag
			                   	, datearSuccessCallback: function (dateo) {
			                         		$scope.tag.dateos.unshift(dateo);
			                         		if (dateo.is_geolocated) addMarker(dateo);
			                         		if (dateo.has_images) $scope.tag.dateosWithImages.unshift(dateo);
			                         		updateTag();
			                         		// TODO: fit bounds if marker outside of map view
			                         }
			                   };
			                 }
			               }
			             } );
		} else {
			$location.path('/registrate');
		}
	}

	$scope.tag.focusDateo = function ( idx ) {
		var markerName
		  , center = {}
		  ;
		markerName = 'marker'+idx;
		if ( $scope.tag.leaflet.markers[markerName] ) {
			center.lat  = $scope.tag.leaflet.markers[markerName].lat;
			center.lng  = $scope.tag.leaflet.markers[markerName].lng;
			center.zoom = $scope.tag.leaflet.center.zoom < 15 ? 15 : $scope.tag.leaflet.center.zoom;
			angular.extend( $scope.tag.leaflet.center, center );
			// $timeout( function () {
				$scope.tag.leaflet.markers[markerName].focus = true;
			// }, 1000 );
		}
		console.log( 'focusDateo', idx, $scope.tag.leaflet.markers[markerName].focus );
	}

	$scope.tag.followTag = function () {
		var id = $scope.tag.id;
		console.log( 'followTag' );
		if ( $scope.tag.followable ) {
			$scope.tag.followable = false;
			Api.follow
			.doFollow( { content_type: 'tag', object_id: id } )
			.then( function ( response ) {
				User.updateUserDataFromApi();
			}, function ( reason ) {
				$scope.tag.followable = true;
				console.log( reason );
			} );
		}
	}

	$scope.tag.unfollowTag = function () {
		var id = $scope.tag.id;
		if ( !$scope.tag.followable ) {
			$scope.tag.followable = true;
			Api.follow
			.doUnfollow( { user: User.data.id, content_type: 'tag', object_id: id } )
			.then( function ( response ) {
				User.updateUserDataFromApi();
			}, function ( reason ) {
				$scope.tag.followable = false;
				console.log( reason );
			} );
		}
	}

	$scope.tag.searchDateos = function () {
		if ( $scope.tag.searchDateosKeyword ) {
			buildDateos( { q: $scope.tag.searchDateosKeyword } );
			$scope.tag.loading.leaflet = true;
			$scope.tag.loading.dateos = true;
		} else {
			buildDateos();
			$scope.tag.loading.leaflet = true;
			$scope.tag.loading.dateos = true;
		}
	}

	$scope.tag.onSelectFilterChange = function () {
		$scope.campaign.loading.leaflet = true;
		$scope.campaign.loading.dateos = true;
		buildDateos();
	}

if ( $routeParams.tagName ) {
	isMainTag().then( function ( givens ) {
		if ( givens.isMainTag ) {
			goToMainTag( { username: givens.tagObj[0].user.username
			             , tagName : givens.tagObj[0].main_tag.tag
			             } );
		} else {
			buildTag();
		}
	}, function ( reason ) {
		console.log( reason );
	} );
	angular.extend( $scope.tag.leaflet, config.defaultMap );
}

$scope.$on('$destroy', function () {
	markersBounds   = [];
	$scope.tag = {};
	leafletMarkersHelpers.resetCurrentGroups();
});

} ] );
