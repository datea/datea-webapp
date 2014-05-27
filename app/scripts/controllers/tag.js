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
) {

	var sessionMarkersIdx = 0
	  , markersBounds     = []
	// fn declarations
	  , isMainTag
	  , isUserFollowing
	  , buildDateos
	  , buildDateosWithImages
	  , buildMarkers
	  , buildTag
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

	isUserFollowing = function () {
		return !!~User.data.tags_followed.map( function ( t ) { return t.id; } ).indexOf( $scope.tag.id );
	}

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
				console.log( 'buildTag', response );
				angular.extend($scope.tag, response.objects[0]);
				$scope.tag.followable = $scope.tag.isUserSignedIn && !isUserFollowing();
				console.log('getTags', $scope.tag );
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
			value.user.image_small = value.user.image_small
			? value.user.image_small
			: config.defaultImgProfile;
			value._prettyDate = $filter('date')( value.date, 'fullDate' );
			markers['marker'+sessionMarkersIdx] = {
			  lat       : value.position.coordinates[1]
			, lng       : value.position.coordinates[0]
			, group			: value.admin_level3
			, label     : { message: '#' + value.tags[0].tag }
			, message   : $interpolate( config.marker )(value)
			, draggable : false
			, focus     : false
			, _id       : value.id
			};
			sessionMarkersIdx += 1;
			markersBounds.push( [ value.position.coordinates[1], value.position.coordinates[0] ] );
		} );
		center.lat  = markers.marker0.lat;
		center.lng  = markers.marker0.lng;
		center.zoom = config.campaign.mapZoomFocus;
		angular.extend( $scope.tag.leaflet.markers, markers );
		angular.extend( $scope.tag.leaflet.center, center );
		leafletData.getMap("leafletTag")
		.then( function ( map ) {
			map.fitBounds( markersBounds );
		} );
		$scope.tag.loading.leaflet = false;
	}

	goToMainTag = function ( givens ) {
		$location.path( givens.username + '/' + givens.tagName );
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
			                   return { defaultTag : $scope.tag.tag };
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

} ] );
