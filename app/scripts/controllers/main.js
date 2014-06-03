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
  , 'ActivityUrl'
  , '$filter'
  , '$timeout'
  , 'State'
  , 'leafletBoundsHelpers'
  , '$log'
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
  , ActivityUrl
  , $filter
  , $timeout
  , State
  , leafletBoundsHelpers
  , $log
) {
	var data
	  , ls = localStorageService
	  , dateo             = {}
	  , campaigns         = []
	  , sessionMarkers    = {}
	  , sessionMarkersIdx = 0
	  , lastMarkerWithFocus
	  , lastBounds
	  , dontCheckCenterOutOfBounds
	  // fn declarations
	  , createBoundsFromCoords
	  , geolocateAndBuildMap
	  , getMarkerWithFocusIdx
	  , isMarkerDup
	  , isCenterOutOfBounds
	  , isTagFollowable
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
	  , buildFollowingTags
	  , buildTrendingTags
	  , buildWeeklyDateo
	  ;

	$scope.flow           = {};
	$scope.pagination     = {};
	$scope.homeSI         = {};
	$scope.homeSI.leaflet = {};
	$scope.homeSI.history = [];

	$scope.homeSI.selectedMarker    = 'last';
	$scope.homeSI.loading = {};
	$scope.homeSI.loading.leaflet   = true;
	$scope.homeSI.loading.campaigns = true;

	// $scope.homeSI.leaflet = { bounds   : [ [ -12.0735, -77.0336 ], [ -12.0829, -77.0467 ] ]
	//                , center   : { lat: -12.05, lng: -77.06, zoom: 13 }
	//                , defaults : { scrollWheelZoom: false }
	//                , markers  : {}
	//                }

	$scope.homeSI.leaflet = angular.copy( config.defaultMap );

	buildFollowingTags = function () {
		Api.tag
		.getTags( { followed: User.data.id } )
		.then( function ( response ) {
			console.log( 'followingTags', response );
			$scope.homeSI.followingTags = response.objects;
		}, function ( reason ) {
			console.log( reason );
		} );
	}

	buildTrendingTags = function () {
		$scope.homeSI.trendingTags = [];
		Api.tag
		.getTrendingTags( { limit: 5, days: 40 } )
		.then( function ( response ) {
			angular.forEach( response.objects , function ( value, key ){
				// if ( !~$scope.homeSI.followingTags.map( function ( e ) { return e.id; } ).indexOf( value.id ) ) {
				// 	value._followable = true;
				// }
				if ( isTagFollowable( { id: value.id, tags: $scope.homeSI.followingTags } ) ) {
					value._followable = true;
				}
				$scope.homeSI.trendingTags.push( value );
			} );
		} );
	}

	isTagFollowable = function ( givens ) {
		var id
		  , tags
		  ;

		id   = givens && givens.id;
		tags = givens && givens.tags;

		if ( !~tags.map( function ( e ) { return e.id; } ).indexOf( id ) ) {
			return true;
		}
		return false;
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
				value._url = ActivityUrl.parse( value );
				value._message = $interpolate( config.homeSI.activityContentMsg.byUser[ value.verb ] )(value);
				$scope.homeSI.history.push( value );
			});
		} )
	}

	buildCampaigns = function ( givens ) {
		var totalCount
		  , index
		  , query
		  , defaultQuery
		  ;

		index = givens && givens.index * config.homeSI.campaignsOffset;
		defaultQuery = { order_by: '-featured,-created'
		               , limit   : 6
		               , offset  : index || 0
		               }
		query = givens && givens.query || defaultQuery;

		Api.campaign
		.getCampaigns( query )
		.then( function ( response ) {
			// console.log( response.objects );
			$scope.homeSI.campaigns = response.objects;
			buildPagination( response );
			$scope.homeSI.loading.campaigns = false;
		}, function ( reason ) {
			console.log( reason );
		} );

	}

	$scope.$watch( 'pagination.currentPage', function () {
		if ( User.isSignedIn() ) {
			buildCampaigns( { index : $scope.pagination.currentPage - 1 } );
			$scope.homeSI.loading.campaigns = true;
		}
	} );

	buildPagination = function ( response ) {
		$scope.pagination.totalItems   = response.meta.total_count;
		$scope.pagination.itemsPerPage = config.homeSI.paginationLimit;
	}

	createBoundsFromCoords = function ( givens ) {
		return [ [ givens.lat + config.defaultBoundsRatio, givens.lng + config.defaultBoundsRatio ]
		       , [ givens.lat - config.defaultBoundsRatio, givens.lng - config.defaultBoundsRatio ] ];
	}

	buildMap = function ( givens ) {
		var dateosGivens = givens && givens.dateosGivens || {}
		  , center       = {}
		  , bounds
		  , map
		  ;

		// console.log( 'bounds buildMap', createBoundsFromCoords(
		// { lat: givens.center.coords.latitude
		// , lng: givens.center.coords.longitude }
		// )  )

		bounds = leafletBoundsHelpers.createBoundsFromArray( createBoundsFromCoords(
		{ lat: givens && givens.center && givens.center.coords.latitude || User.data.ip_location.latitude || config.defaultMap.center.lat
		, lng: givens && givens.center && givens.center.coords.longitude || User.data.ip_location.longitude || config.defaultMap.center.lng }
		) )

		center.lat = givens && givens.center && givens.center.coords.latitude;
		center.lng = givens && givens.center && givens.center.coords.longitude;

		map        = angular.copy( config.defaultMap );
		// map        = { bounds   : [ [ -12.0735, -77.0336 ], [ -12.0829, -77.0467 ] ]
		//              , center   : { lat: -12.05, lng: -77.06, zoom: 15 }
		//              , defaults : { scrollWheelZoom: false }
		//              , markers  : {}
		//              }
		// map.bounds = bounds;

		if ( center.lat && center.lng ) {
			map.center.lat = center.lat;
			map.center.lng = center.lng
		}

		if ( !Object.keys( dateosGivens ).length ) {
			// dateosGivens.latitude  = center.lat || config.defaultMap.center.lat;
			// dateosGivens.longitude = center.lng || config.defaultMap.center.lng;
			// dateosGivens.distance  = 2000;
			dateosGivens.bottom_left_latitude  = bounds.southWest.lat;
			dateosGivens.bottom_left_longitude = bounds.southWest.lng;
			dateosGivens.top_right_latitude    = bounds.northEast.lat;
			dateosGivens.top_right_longitude   = bounds.northEast.lng;
			dontCheckCenterOutOfBounds = false;
			// Only make a request if new the center is outside the map boundaries
			leafletData.getMap('leafletHomeSI')
			.then( function ( map ) {
				lastBounds = map.getBounds();

				$scope.$watch( 'homeSI.leaflet.center.lat+homeSI.leaflet.center.lng', function () {
					isCenterOutOfBounds();
				} );
			} );
		} else {
			dontCheckCenterOutOfBounds = true;
			dateosGivens.updateCenter  = true;
		}
		angular.extend( $scope.homeSI.leaflet, map );

		buildMarkers( dateosGivens );
	}

	isCenterOutOfBounds = function () {
		if ( !dontCheckCenterOutOfBounds ) {
			leafletData.getMap('leafletHomeSI')
			.then( function ( map ) {
				var bounds;
				bounds = map.getBounds();

				buildMarkers(
				{ bottom_left_latitude  : bounds._southWest.lat
				, bottom_left_longitude : bounds._southWest.lng
				, top_right_latitude    : bounds._northEast.lat
				, top_right_longitude   : bounds._northEast.lng}
				);
			} );
		}
		// if ( !dontCheckCenterOutOfBounds ) {
		// 	leafletData.getMap('leafletHomeSI')
		// 	.then( function ( map ) {
		// 		var bounds = lastBounds;
		// 		if ( $scope.homeSI.leaflet.center.lat >= bounds._northEast.lat || $scope.homeSI.leaflet.center.lat < bounds._southWest.lat
		// 		|| $scope.homeSI.leaflet.center.lng <= bounds._southWest.lng || $scope.homeSI.leaflet.center.lng < bounds._southWest.lng ) {
		// 			console.log('out of bounds');
		// 			buildMarkers( { latitude : $scope.homeSI.leaflet.center.lat
		// 			              , longitude: $scope.homeSI.leaflet.center.lng
		// 			              , distance : 2000
		// 			              }	);
		// 			lastBounds = map.getBounds();
		// 		}
		// 	} );
		// }
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
		var map          = {}
		  , markers      = {}
		  , givens       = givens || {}
		  , updateCenter
		  ;

		updateCenter = givens.updateCenter;
		delete givens.updateCenter;
		givens.limit = config.homeSI.dateosLimitByRequest;

		if ( $scope.homeSI.selectedMarker !== 'last' ) {
			givens.order_by            = config.selectFilter[ $scope.homeSI.selectedMarker ];
			dontCheckCenterOutOfBounds = true;
			givens.updateCenter        = true;
		}
		if ( $scope.homeSI.searchDateosKeyword ) {
			givens.q                   = $scope.homeSI.searchDateosKeyword;
			dontCheckCenterOutOfBounds = true;
			givens.updateCenter        = true;
		}

		Api.dateo.getDateos( givens )
		.then( function ( response ) {
			if ( response.objects ) {
				angular.forEach( response.objects, function ( value, key ){
					if ( value.position && !isMarkerDup( { marker : value } ) ) {
						// default image for markers
						value.user.image_small = value.user.image_small
						? value.user.image_small
						: config.defaultImgProfile;
						value._prettyDate = $filter('date')( value.date, 'fullDate' );
						markers['marker'+sessionMarkersIdx] = {
						  lat       : value.position.coordinates[1]
						, lng       : value.position.coordinates[0]
						// , group     : value.tag
						, label     : { message: '#' + value.tags[0].tag }
						, message   : $interpolate( config.marker )( value )
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
				// console.log( 'updateCenter', givens, givens.updateCenter );
				if ( updateCenter ) {
					map.center      = {};
					map.center.lat  = map.markers[ 'marker'+0 ].lat;
					map.center.lng  = map.markers[ 'marker'+0 ].lng;
					map.center.zoom = config.homeSI.mapZoomOverride;
					map.markers[ 'marker'+0 ].focus = true;
				}
				angular.extend( $scope.homeSI.leaflet, map );
				$scope.homeSI.loading.leaflet = false;
			}
		}, function ( reason ) {
			console.log( reason );
		} );
	}

	geolocateAndBuildMap = function ( givens ) {
		// buildMap( givens );
		// no spam
		geo.getLocation( { timeout:10000 } )
		.then( function ( data ) {
			console.log( 'geolocatedCenter', data );
			buildMap( { center : data } );
		}, function () {
			buildMap();
		} );
	}

	resetMarkers = function () {
		$scope.homeSI.leaflet.markers    = {};
		sessionMarkers    = {};
		sessionMarkersIdx = 0;
	}

	onSignIn = function () {
		var map
		  , bounds
		  ;

		State.isLanding             = false;
		$scope.flow.isSignedIn      = false;
		$scope.user                 = User.data;
		$scope.homeSI.followingTags = User.data.tags_followed;

		map               = angular.copy( config.defaultMap );
		config.defaultMap = map;
		map.center.zoom = config.homeSI.mapZoomOverride;
		map.bounds      = leafletBoundsHelpers.createBoundsFromArray( [ [ -12.0735, -77.0336 ], [ -12.0829, -77.0467 ] ] );
		// map.center      = {};
		angular.extend( $scope.homeSI.leaflet, map );

		geolocateAndBuildMap();
		// buildMap();
		buildCampaigns();
		buildActivityLog();
		buildWeeklyDateo();
		buildTrendingTags();
		buildFollowingTags();
	}

	onSignUp = function () {
		onSignIn();
	}

	onSignOut = function () {
		State.isLanding = true;
		$scope.flow.isSignedIn = true;
	}

	$scope.homeSI.geolocate = function () {
		$scope.homeSI.loading.leaflet = true;
		resetMarkers();
		$scope.homeSI.selectedMarker      = 'last';
		$scope.homeSI.searchDateosKeyword = '';
		dontCheckCenterOutOfBounds        = false;
		geolocateAndBuildMap( { dateosGivens : { updateCenter : true } } );
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
		             , windowClass : 'datear-modal'
		             , resolve     : {
		                datearModalGivens : function () {
		                   return {};
		                 }
		               }
		             } );
	}

	$scope.flow.share = function () {
		$modal.open( { templateUrl : 'views/share.html'
		             , controller  : 'ShareCtrl'
		             , resolve		 : {
		                 shareModalGivens : function () {
		                 	return {}
		                 }
		             } } );
	}

	$scope.homeSI.searchDateos = function () {
		if ( $scope.homeSI.searchDateosKeyword ) {
			$scope.homeSI.loading.leaflet = true;
			resetMarkers();
			buildMap( { dateosGivens : { q: $scope.homeSI.searchDateosKeyword } } );
		}
	}

	$scope.homeSI.searchDateosWithImages = function () {
		var dateosGivens = {};
		$scope.homeSI.loading.leaflet = true;
		resetMarkers();
		if ( $scope.homeSI.searchDateosKeyword ) {
			dateosGivens.q = $scope.homeSI.searchDateosKeyword;
		}
		dateosGivens.has_images = 1;
		buildMap( { dateosGivens : dateosGivens } );
	}

	$scope.homeSI.fullscreen = function () {
		if ( Fullscreen.isEnabled() ) {
			Fullscreen.cancel();
		} else {
			Fullscreen.enable( document.getElementById('homeSI-map-holder') );
		}
	}

	$scope.homeSI.searchCampaigns = function () {
		console.log( '$scope.homeSI.searchCampaigns', $scope.homeSI.loading.campaigns,$scope.homeSI);
		$scope.homeSI.loading.campaigns = true;
		if ( $scope.homeSI.searchCampaignsKeyword ) {
			console.log( '$scope.homeSI.searchCampaigns 2', $scope.homeSI.loading.campaigns);
			buildCampaigns( { query :
			{ q      : $scope.homeSI.searchCampaignsKeyword
			, limit  : config.homeSI.campaignOffset
			, offset : 0 } }
			);
		} else {
			buildCampaigns();
		}
	}

	getMarkerWithFocusIdx = function () {
		return lastMarkerWithFocus ? +lastMarkerWithFocus.replace('marker','') : 0;
	}

	$scope.homeSI.focusNextMarker = function ( givens ) {
		var idx
		  , markerName
		  , direction = givens && givens.direction
		  , center = {}
		  ;
		// If there is no next valid Marker
		if ( ( getMarkerWithFocusIdx() === 0 && direction === 0 )
		|| ( getMarkerWithFocusIdx() === Object.keys($scope.homeSI.leaflet.markers).length && direction === 1) ) {
			lastMarkerWithFocus = 'marker0';
			$scope.homeSI.leaflet.markers[lastMarkerWithFocus].focus = true;
			return;
		}
		idx = direction ? getMarkerWithFocusIdx() + 1 : getMarkerWithFocusIdx() - 1;
		markerName = 'marker'+idx;
		// center.lat = $scope.homeSI.leaflet.markers[markerName].lat;
		// center.lng = $scope.homeSI.leaflet.markers[markerName].lng;
		// center.zoom = $scope.homeSI.leaflet.center.zoom;
		// angular.extend( $scope.homeSI.leaflet.center, center );
		$scope.homeSI.leaflet.markers[markerName] && ( $scope.homeSI.leaflet.markers[markerName].focus = true );
		$scope.$broadcast( 'leafletDirectiveMarker.click', { markerName : markerName } );
		isCenterOutOfBounds();
	}

	$scope.homeSI.onSelectFilterChange = function () {
		$scope.homeSI.loading.leaflet = true;
		resetMarkers();
		buildMarkers();
	}

	$scope.homeSI.followTag = function ( idx ) {
		var id  = $scope.homeSI.trendingTags[idx].id
		  , tag = $scope.homeSI.trendingTags[idx]
		  ;
		if ( tag._followable ) {
			Api.follow
			.doFollow( { content_type: 'tag', object_id: id } )
			.then( function ( response ) {
				$scope.homeSI.trendingTags[idx]._followable = false;
				User.updateUserDataFromApi();
				$timeout( function () {
					$scope.homeSI.followingTags = ls.get('user').tags_followed;
				}, 1000 );
			}, function ( reason ) {
				console.log( reason );
			} );
		}
	}

	$scope.flow.goToDetail = function ( tag ) {
		if ( tag.campaigns[0].username ) {
			$location.path('#/'+tag.campaigns[0].username+'/'+tag.tag );
		}

	}

	$scope.$on( 'leafletDirectiveMarker.click', function ( ev, args ) {
		console.log( 'focus event', args.markerName );
		lastMarkerWithFocus = args.markerName;
	} );

	$scope.$on('$destroy', function () {
		console.log( 'destroy' );
		$scope.homeSI = {};
	});

	$rootScope.$on( 'user:signedIn', function () {
		onSignIn();
	} );

	$rootScope.$on( 'user:signedOut', function () {
		onSignOut();
	} );

	$rootScope.$on( 'user:signedUp', function () {
		onSignUp();
	} );

	$rootScope.$on( 'user:updated', function () {
		$scope.user = User.data;
	} );

	if( User.isSignedIn() ) {
		onSignIn();
	}

} ] );
