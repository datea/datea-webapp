'use strict';

angular.module( 'dateaWebApp' )
.controller( 'MainCtrl'
, [ '$scope'
  , 'User'
  , '$http'
  , '$location'
  , '$rootScope'
  , 'config'
  , 'localStorageService'
  , 'geolocation'
  , 'Api'
  , '$modal'
  , '$interpolate'
  , 'leafletData'
  , '$q'
  , 'Fullscreen'
, function (
    $scope
  , User
  , $http
  , $location
  , $rootScope
  , config
  , localStorageService
  , geo
  , Api
  , $modal
  , $interpolate
  , leafletData
  , $q
  , Fullscreen
) {
	var data
	  , ls = localStorageService
	  , dateo             = {}
	  , campaigns 				= []
	  , sessionMarkers 		= {}
	  , sessionMarkersIdx = 0
	  , lastMarkerWithFocus
	  , lastBounds
	  , dontCheckCenterOutOfBounds
	  // fn declarations
	  , geolocateAndBuildMap
	  , getMarkerWithFocusIdx
	  , isMarkerDup
	  , isCenterOutOfBounds
	  , resetMarkers
	  , onSignIn
	  , onSignUp
	  , onSignOut
	  // , onGeolocation
	  // , onGeolocationError
	  , buildMap
	  , buildMarkers
	  , buildCampaigns
	  , buildPagination
	  , buildActivityLog
	  , buildActivityUrl
	  , buildTrendingTags
	  , buildWeeklyDateo
	  ;
	$scope.flow       = {};
	$scope.pagination = {};
	$scope.homeSI     = {};
	$scope.homeSI.history = [];

	buildTrendingTags = function () {
		Api.tag
		.getTrendingTags( { limit: 5 } )
		.then( function ( response ) {
			console.log( 'trending', response );
			$scope.homeSI.trendingTags = response.objects;
		} )
	}

	buildWeeklyDateo = function () {
		Api.dateo
		.getDateos( { limit: 1 } )
		.then( function ( response ) {
			console.log('weekly', response.objects[0]);
			$scope.homeSI.weeklyDateo = response.objects[0];
		}, function ( reason ) {
			console.log( reason );
		} );
	}

	buildActivityLog = function () {
		var activityLog = [];
		Api.activityLog
		.getActivityOfUserByUserId(
		{ user : User.data.id
		, mode : 'all'
		} )
		.then( function ( response ) {
			console.log( 'buildActivityLog response', response );
			activityLog = response.objects.filter( function ( value ) {
				return !!~config.homeSI.activityVerbs.indexOf( value.verb );
			} );
			angular.forEach( activityLog, function ( value, key ){
				value._url = buildActivityUrl( value );
				value._message = $interpolate( config.homeSI.activityContentMsg.byUser[ value.verb ] )(value);
				$scope.homeSI.history.push( value );
			});
		} )
	}

	buildActivityUrl = function ( givens ) {
		var url;
		if ( givens.verb === 'dateo' ) {
			if ( givens.action_object.user.username ) {
				url = '/' + givens.action_object.user.username + '/dateos/' + givens.action_object.id;
			} else {
				url = '/' + givens.target_object.user.username + '/dateos/' + givens.target_object.id;
			}
		} else if ( givens.verb === 'commented' ) {
			if ( givens.target_object.user.username ) {
				url = '/' + givens.target_object.user.username + '/dateos/' + givens.target_object.id;
			}
		} else if ( givens.verb === 'voted' ) {
			if ( givens.target_object.user.username ) {
				url = '/' + givens.target_object.user.username + '/dateos/' + givens.target_object.id;
			}
		}
		return url;
	}

	buildCampaigns = function ( givens ) {
		var totalCount
		  , index
		  ;

		index = givens && givens.index * config.homeSI.campaignsOffset;

		Api.campaign
		.getCampaigns(
		{ order_by: '-featured,-created'
		, limit   : 12
		, offset  : index || 0 }
		)
		.then( function ( response ) {
			$scope.homeSI.campaigns = response.objects;
			buildPagination( response );
		}, function ( reason ) {
			console.log( reason );
		} );

	}

	$scope.$watch( 'pagination.currentPage', function () {
		buildCampaigns( { index : $scope.pagination.currentPage - 1 } );
	} )

	buildPagination = function ( response ) {
		$scope.pagination.totalItems   = response.meta.total_count;
		$scope.pagination.itemsPerPage = 12;
	}

	buildMap = function ( givens ) {
		var dateosGivens = givens && givens.dateosGivens || {}
			, center       = {}
			, map
			;

		center.lat = givens && givens.center && givens.center.coords.latitude;
		center.lng = givens && givens.center && givens.center.coords.longitude;

		map = config.defaultMap;
		if ( center.lat && center.lng ) {
			map.center.lat = center.lat;
			map.center.lng = center.lng
		}

		if ( !Object.keys( dateosGivens ).length ) {
			dateosGivens.latitude  = center.lat || config.defaultMap.center.lat;
			dateosGivens.longitude = center.lng || config.defaultMap.center.lng;
			dateosGivens.distance  = 2000;
			dontCheckCenterOutOfBounds = false;
			// Only make a request if new the center is outside the map boundaries
			leafletData.getMap()
			.then( function ( map ) {
				lastBounds = map.getBounds();

				$scope.$watch( 'center.lat+center.lng', function () {
					isCenterOutOfBounds();
				} );
			} );
		} else {
			dontCheckCenterOutOfBounds = true;
			dateosGivens.updateCenter  = true;
		}

		angular.extend( $scope, map );

		buildMarkers( dateosGivens );
	}

	isCenterOutOfBounds = function () {
		if ( !dontCheckCenterOutOfBounds ) {
			leafletData.getMap()
			.then( function ( map ) {
				var bounds = lastBounds;
				if ( $scope.center.lat >= bounds._northEast.lat || $scope.center.lat < bounds._southWest.lat
				|| $scope.center.lng <= bounds._southWest.lng || $scope.center.lng < bounds._southWest.lng ) {
					console.log('out of bounds');
					buildMarkers( { latitude : $scope.center.lat
					              , longitude: $scope.center.lng
					              , distance : 2000
					              }	);
					lastBounds = map.getBounds();
				}
			} );
		}
	}

	isMarkerDup = function ( givens ) {
		var marker = givens && givens.marker
		  , isDup
		  ;
		angular.forEach( sessionMarkers , function ( value, key ) {
			if ( value._id === marker.id ) {
				isDup = true;
			}
		});
		return isDup ? true : false;
	}

	buildMarkers = function ( givens ) {
		var map     = {}
		  , markers = {}
		  ;
		givens.limit = config.homeSI.dateosLimitByRequest;
		Api.dateo.getDateos( givens )
		.then( function ( response ) {
			angular.forEach( response.objects, function ( value, key ){
				if ( value.position && !isMarkerDup( { marker : value } ) ) {
					markers['marker'+sessionMarkersIdx] = {
					  lat       : value.position.coordinates[1]
					, lng       : value.position.coordinates[0]
					, message   : value.extract
					, draggable : false
					, focus     : false
					, _id       : value.id
					}
					sessionMarkersIdx += 1;
				}
			});
			console.log( 'sessionMarkers', sessionMarkers );
			angular.extend( sessionMarkers, markers );
			map.markers = sessionMarkers;
			$scope.homeSI.markers = Object.keys( sessionMarkers );
			if ( givens && givens && givens.updateCenter ) {
				map.center = {};
				map.center.lat = map.markers[ 'marker'+0 ].lat;
				map.center.lng = map.markers[ 'marker'+0 ].lng;
				map.center.zoom = config.homeSI.mapZoomOverride;
			}
			angular.extend( $scope, map );
		}, function ( reason ) {
			console.log( reason );
		} );
	}

	geolocateAndBuildMap = function () {
		geo.getLocation( { timeout:10000 } )
		.then( function ( data ) {
			buildMap( { center : data } )
		}, function () {
			buildMap();
		} );
	}

	resetMarkers = function () {
		$scope.markers    = {};
		sessionMarkers    = {};
		sessionMarkersIdx = 0;
	}

	onSignIn =function () {
		var map;

		$scope.flow.isSignedIn = false;
		$scope.user = User.data;
		map = config.defaultMap;
		map.center.zoom = config.homeSI.mapZoomOverride;
		angular.extend( $scope, map );

		geolocateAndBuildMap();
		// buildMap();
		buildCampaigns();
		buildActivityLog();
		buildWeeklyDateo();
		buildTrendingTags();
	}

	onSignUp = function () {
		onSignIn();
	}

	onSignOut = function () {
		$scope.flow.isSignedIn = true;
	}

	$scope.homeSI.geolocate = function () {
		resetMarkers();
		geolocateAndBuildMap();
	}

	$scope.flow.isSignedIn = !User.isSignedIn();

	$scope.flow.signIn = function () {
		$location.path( '/signin' );
	}

	$scope.flow.signUp = function () {
		$location.path( '/registrate' );
	}

	$scope.flow.datear = function () {
		$modal.open( { templateUrl : 'views/datear.html'
		             , controller  : 'DatearCtrl'
		             } );
	}

	$scope.homeSI.search = function () {
		resetMarkers();
		buildMap( { dateosGivens : { q: $scope.homeSI.searchKeyword } } );
	}

	$scope.homeSI.fullscreen = function () {
		if ( Fullscreen.isEnabled() ) {
			Fullscreen.cancel();
		} else {
			Fullscreen.enable( document.getElementById('homeSI-map-holder') );
		}
	}

	getMarkerWithFocusIdx = function () {
		return lastMarkerWithFocus ? +lastMarkerWithFocus.replace('marker','') : 0;
	}

	$scope.homeSI.focusNextMarker = function ( givens ) {
		var idx
		  , markerName
		  , direction = givens && givens.direction
		  ;
		// If there is no next valid Marker
		if ( ( getMarkerWithFocusIdx() === 0 && direction === 0 )
		|| ( getMarkerWithFocusIdx() === Object.keys($scope.markers).length && direction === 1) ) {
			lastMarkerWithFocus = 'marker0';
			$scope.markers[lastMarkerWithFocus].focus = true;
			return;
		}
		idx = direction ? getMarkerWithFocusIdx() + 1 : getMarkerWithFocusIdx() - 1;
		markerName = 'marker'+idx;
		$scope.markers[markerName] && ( $scope.markers[markerName].focus = true );
		$scope.$broadcast( 'leafletDirectiveMarker.click', { markerName : markerName } );
		isCenterOutOfBounds();
	}

	$scope.$on( 'leafletDirectiveMarker.click', function ( ev, args ) {
		console.log( 'focus event', args.markerName );
		lastMarkerWithFocus = args.markerName;
	} )

	$rootScope.$on( 'user:signedIn', function () {
		onSignIn();
	} );

	$rootScope.$on( 'user:signedOut', function () {
		onSignOut();
	} );

	$rootScope.$on( 'user:signedUp', function () {
		onSignUp();
	} );

	if( User.isSignedIn() ) {
		onSignIn();
	}

} ] );
