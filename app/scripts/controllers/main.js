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
  , 'leafletMarkersHelpers'
  , '$log'
  , 'Piecluster'
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
  , leafletMarkersHelpers
  , $log
  , Piecluster
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
	  , queryCache	      = {}
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
	  , openSpiderfy
	  // , onGeolocation
	  // , onGeolocationError
	  , buildMap
	  , buildMarkers
	  , buildCampaigns
	  , buildCampaignsFollowed
	  , buildPagination
	  , buildActivityLog
	  , buildActivityUrl
	  , buildFollowingTags
	  , buildTrendingTags
	  , buildWeeklyDateo
	  , buildMarkerIcon
	  , buildClusterIcon
	  , buildPieClusterIcon
	  , selectClusterFunction
	  , clusterSizeRange
	 	, makeSVGClusterIcon
	  , makeSVGPie
	  , serializeXmlNode
	;

	$scope.flow           = {};
	$scope.query          = {};
	$scope.pagination     = {};
	
	$scope.homeSI                   = {};
	$scope.homeSI.leaflet           = {};
	$scope.homeSI.history           = [];
	$scope.homeSI.selectedMarker    = 'last';
	$scope.homeSI.loading           = {};
	$scope.homeSI.loading.leaflet   = true;
	$scope.homeSI.loading.campaigns = true;
	$scope.homeSI.hasLegend         = false;
	$scope.homeSI.userTagsArray     = [];
	$scope.homeSI.activeTab 			  = 'dateos';
	$scope.homeSI.activeDateoView   = 'map';
	$scope.homeSI.dateosListView    = {limit: 20};
	$scope.homeSI.campaignsFollowed = []

	$scope.query.orderBy            = '-created';
	$scope.query.orderByLabel       = 'últimos';
	$scope.query.followFilter       = 'all';
	$scope.query.followFilterLabel  = 'todos';

	// $scope.homeSI.leaflet = { bounds   : [ [ -12.0735, -77.0336 ], [ -12.0829, -77.0467 ] ]
	//                , center   : { lat: -12.05, lng: -77.06, zoom: 13 }
	//                , defaults : { scrollWheelZoom: false }
	//                , markers  : {}
	//                }

	$scope.$watch('query.orderBy', function() {
		//alert($scope.query.orderBy);
		$scope.homeSI.onFilterChange();
	});

	$scope.$watch('query.followFilter', function() {
		//alert($scope.query.orderBy);
		$scope.homeSI.onFilterChange();
	});

	$scope.homeSI.leaflet = angular.copy( config.defaultMap );

	buildFollowingTags = function () {
		Api.tag
		.getTags( { followed: User.data.id } )
		.then( function ( response ) {
			console.log( 'followingTags', response );
			$scope.homeSI.userTags = {};
			$scope.homeSI.followingTags = response.objects.map( function (t, i) {
				t.color = $scope.homeSI.colorRange[i];
				$scope.homeSI.userTags[t.tag] = t;
				return t;
			});
			User.data.tags_followed = response.objects;
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
		               , limit   : config.homeSI.campaignsOffset
		               , offset  : index || 0
		               }
		query = givens && givens.query || defaultQuery;

		Api.campaign
		.getCampaigns( query )
		.then( function ( response ) {
			// console.log( response.objects );
			$scope.homeSI.campaigns = response.objects;
			//buildPagination( response );
			$scope.homeSI.loading.campaigns = false;
		}, function ( reason ) {
			console.log( reason );
		} );
	}

	buildCampaignsFollowed = function ( givens ) {
		var params;
		if (User.data.tags_followed.length === 0) return;

		params = {
			  order_by: '-created'
		  , limit   : 100
		  , main_tag : User.data.tags_followed.map(function(t) {return t.tag}).join(',')
		};
		$scope.homeSI.loading.campaignsFollowed = true;

		Api.campaign
		.getCampaigns( params )
		.then( function ( response ) {
			// console.log( response.objects );
			$scope.homeSI.campaignsFollowed = response.objects;
			//buildPagination( response );
			$scope.homeSI.loading.campaignsFollowed = false;
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
			.then( function ( lfmap ) {
				lastBounds = lfmap.getBounds();

				// PREGUNTAR A JUAN POR EL watch al zoom
				$scope.$watch( 'homeSI.leaflet.center.lat+homeSI.leaflet.center.lng+homeSI.leaflet.center.zoom', function () {
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
			console.log("IS CENTER OUT OF BOUNDS");
			$scope.homeSI.loading.leafletMore = true;
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
		  , userTags     = []
		;

		updateCenter = givens.updateCenter;
		delete givens.updateCenter;
		givens.limit = config.homeSI.dateosLimitByRequest;

		if ( $scope.query.orderBy !== '-created' ) {
			givens.order_by            = $scope.query.orderBy;
			dontCheckCenterOutOfBounds = true;
			givens.updateCenter        = true;
		}
		if ( $scope.query.search && $scope.query.search != '') {
			givens.q                   = $scope.query.search;
			dontCheckCenterOutOfBounds = true;
			givens.updateCenter        = true;
		}

		if ($scope.query.followFilter === 'follow') {
			if (User.data.tags_followed.length > 0) {
				userTags = User.data.tags_followed.map( function (t) { return t.tag});
				givens.tags = userTags.join(',');
			}else{
				console.log('following no tags');
			}
		}

		Api.dateo.getDateos( givens )
		.then( function ( response ) {
			if ( response.objects ) {
				angular.forEach( response.objects, function ( value, key ){
					var labelTags = []
						, tags     = value.tags && value.tags.map(function(t) {return t.tag}) || []
						, label
					;
					
					if ( value.position && !isMarkerDup( { marker : value } ) ) {
						// default image for markers
						value.user.markerImage = value.user.image_small
 						? config.api.imgUrl+value.user.image_small
						: '/' + config.defaultImgProfile;
						value._prettyDate = $filter('date')( value.date, config.defaultDateFormat );
						markers['marker'+sessionMarkersIdx] = {
						  lat         : value.position.coordinates[1]
						, lng         : value.position.coordinates[0]
						// , group     : value.tag
						, message     : $interpolate( config.marker )( value )
						, draggable   : false
						, focus       : false
						, _id         : value.id
						, _tags       : tags
						, icon 			  : buildMarkerIcon(value)
						, riseOnHover : true
						, group       : '1'
						}

						if ($scope.homeSI.leaflet.focusOnId && $scope.homeSI.leaflet.focusOnId == value.id) {
							markers['marker'+sessionMarkersIdx].focus = true;
						}

						if (tags.length > 0) {
							if ($scope.query.followFilter === 'follow' && givens.tags) {
								labelTags = tags.filter(function (t) { 
									return typeof($scope.homeSI.userTags[t]) != 'undefined';
								});
								markers['marker'+sessionMarkersIdx].label = { message: '#'+labelTags.join(', #') };
							}else{
								label = { message: '#'+tags.slice(0,2).join(', #')};
								markers['marker'+sessionMarkersIdx].label = (tags.length > 2) ? label+'...' : label;  
							}
						}
						sessionMarkersIdx += 1;
					}
				});
				console.log( 'sessionMarkers', sessionMarkers );
				angular.extend( sessionMarkers, markers );
				map.markers = sessionMarkers;
				$scope.homeSI.markers = Object.keys( sessionMarkers );
				// console.log( 'updateCenter', givens, givens.updateCenter );
				if ( updateCenter && Object.keys(map.markers).length > 0) {
					map.center      = {};
					map.center.lat  = map.markers[ 'marker'+0 ].lat;
					map.center.lng  = map.markers[ 'marker'+0 ].lng;
					map.center.zoom = config.homeSI.mapZoomOverride;
					map.markers[ 'marker'+0 ].focus = true;
				}
				angular.extend( $scope.homeSI.leaflet, map );
				$scope.homeSI.loading.leaflet = false;
				$scope.homeSI.loading.leafletMore = false;
				// open popup on requested marker
			}
		}, function ( reason ) {
			console.log( reason );
		} );
	}

	geolocateAndBuildMap = function ( givens ) {
		// buildMap( givens );
		// no spam
		geo.getLocation( { timeout:3000 } )
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

		if (User.data.tags_followed.length) {
			$scope.query.followFilter       = 'follow';
	  	$scope.query.followFilterLabel  = 'lo que sigo';
		}
  	if (User.data.tags_followed.length <= 10) {
			$scope.homeSI.colorRange   =  d3.scale.category10().range();
		}else {
			$scope.homeSI.colorRange   =  d3.scale.category20().range();
		}
		$scope.homeSI.userTags = {};
		$scope.homeSI.followingTags = User.data.tags_followed.map(function (t, i) { 
			t.color = $scope.homeSI.colorRange[i];
			$scope.homeSI.userTags[t.tag] = t;
			return t;
		});
		
		map               = angular.copy( config.defaultMap );
		config.defaultMap = map;
		map.center.zoom = config.homeSI.mapZoomOverride;
		map.bounds      = leafletBoundsHelpers.createBoundsFromArray( [ [ -12.0735, -77.0336 ], [ -12.0829, -77.0467 ] ] );
		// map.center      = {};
		angular.extend( $scope.homeSI.leaflet, map );

		geolocateAndBuildMap();
		// buildMap();
		buildCampaigns();
		buildCampaignsFollowed();
		buildActivityLog();
		buildWeeklyDateo();
		buildTrendingTags();
		buildFollowingTags();
		console.log("HOME SI", $scope.homeSI);
	}

	onSignUp = function () {
		onSignIn();
	}

	onSignOut = function () {
		State.isLanding = true;
		$scope.flow.isSignedIn = true;
	}

	$scope.homeSI.leaflet.checkInvalidSize = function () {
		leafletData.getMap('lealfetHomeSI')
		.then( function (map) {
			map.invalidateSize();
		});
	}

	$scope.homeSI.openTab = function (tabname) {
		console.log("OPEN TAB", tabname);
		if (tabname === 'dateos' && $scope.homeSI.activeDateoView == 'map') {
			$scope.homeSI.leaflet.checkInvalidSize();
		}
	}

	$scope.homeSI.openDateoView = function (viewname) {
		if (viewname == $scope.homeSI.activeDateoView) return;
		$scope.homeSI.activeDateoView = viewname;
		switch(viewname) {
			case 'map':
				$scope.homeSI.geolocate();
				$scope.homeSI.leaflet.checkInvalidSize();
				break;
			case 'list':
				$scope.homeSI.buildDateosListView();
				break;
		}
	}

	$scope.homeSI.buildDateosListView = function () {
		var givens = {}
			, paramStr
		; 
		givens.order_by = $scope.query.orderBy;
		givens.limit    = $scope.homeSI.dateosListView.limit;
		givens.page     = $scope.query.page;

		if ($scope.query.search && $scope.query.search.trim() != '') {
			givens.q = $scope.query.search;
		}
		if ($scope.query.followFilter === 'follow') {
			givens.tags = User.data.tags_followed.map(function (t) { return t.tag}).join(',');
		}

		paramStr = JSON.stringify(givens);
		if (queryCache.list && queryCache.list == paramStr) return;
		queryCache.list = paramStr;

		$scope.homeSI.loading.dateosListView = true;

		Api.dateo.getDateos( givens )
		.then(function(response) {
			$scope.homeSI.dateosListView.dateos      = response.objects;
			$scope.homeSI.dateosListView.totalCount  = response.meta.total_count;
			$scope.homeSI.loading.dateosListView = false;
		}, function (reason) {
			console.log(reason);
		});
	}

	$scope.homeSI.geolocate = function () {
		$scope.homeSI.loading.leaflet = true;
		resetMarkers();
		$scope.query.orderBy = '-created';
		$scope.query.search  = '';
		dontCheckCenterOutOfBounds = false;
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
		             , backdrop    : 'static'
		             , resolve     : {
		                datearModalGivens : function () {
		                   return {
		                   	datearSuccessCallback: function (dateo) {
		                   		var test, newCenter;
		                   		// Only make a request if new the center is outside the map boundaries
													leafletData.getMap('leafletHomeSI')
													.then( function ( map ) {
														var bounds;
														// dateo is inside current filters (only consider user tags)
														$scope.query.orderBy = '-created';
		                   			if ($scope.query.followFilter === 'follow') {
		                   				test = false;
		                   				for (var i in dateo.tags) {
		                   					if (!!$scope.homeSI.userTags[dateo.tags[i].tag]) {
		                   						test = true;
		                   						break;
		                   					}
		                   				}
		                   				if (!test) $scope.query.followFilter = 'all';
		                   			}

		                   			$scope.homeSI.leaflet.focusOnId = dateo.id;

		                   			newCenter = L.latLng(dateo.position.coordinates[1], dateo.position.coordinates[0]);
		                   			dontCheckCenterOutOfBounds = true;
		                   			map.setView(newCenter, config.homeSI.zoomAfterDatear, {reset: true});
		                   			bounds = map.getBounds();
		               					buildMarkers(
														{ bottom_left_latitude  : bounds._southWest.lat
														, bottom_left_longitude : bounds._southWest.lng
														, top_right_latitude    : bounds._northEast.lat
														, top_right_longitude   : bounds._northEast.lng}
														);
		               					dontCheckCenterOutOfBounds = false;

                   					if ($scope.homeSI.activeDateoView == 'list') {
                   						buildDateosListView();
                   					}
													} );
												}
		                  }
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
		if ($scope.homeSI.activeDateoView === 'map') {
			$scope.homeSI.loading.leaflet = true;
			resetMarkers();
			buildMap();
		}else if ($scope.homeSI.activeDateoView === 'list') {
			$scope.query.page = 0;
			$scope.homeSI.buildDateosListView();
		}
	}

	$scope.homeSI.searchDateosWithImages = function () {
		var dateosGivens = {};
		$scope.homeSI.loading.leaflet = true;
		resetMarkers();
		if ( $scope.query.search ) {
			dateosGivens.q = $scope.query.search;
		}
		dateosGivens.has_images = 1;
		buildMap( { dateosGivens : dateosGivens } );
	}

	$scope.homeSI.autocompleteSearch = function ( val ) {
	return Api.tag.getAutocompleteByKeyword( { q: val.replace('#', '') } )
		.then( function ( response ) {
			var tags = [];
			angular.forEach( response.suggestions, function( item ){
				tags.push( '#'+item );
			});
			return tags;
		} );
	}

	$scope.homeSI.fullscreen = function () {
		$scope.homeSI.mapFullscreen = true;
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
		center.lat = $scope.homeSI.leaflet.markers[markerName].lat;
		center.lng = $scope.homeSI.leaflet.markers[markerName].lng;
		center.zoom = 18;
		angular.extend( $scope.homeSI.leaflet.center, center );
		$timeout( function () {
			openSpiderfy();
			$scope.homeSI.leaflet.markers[markerName] && ( $scope.homeSI.leaflet.markers[markerName].focus = true );
		}, 100 );
		$scope.$broadcast( 'leafletDirectiveMarker.click', { markerName : markerName } );
		isCenterOutOfBounds();
	}

	$scope.homeSI.onFilterChange = function () {
		$scope.homeSI.loading.leaflet = true;
		resetMarkers();
		buildMarkers();
	}

	$scope.flow.goToDetail = function ( tag ) {
		if ( tag.campaigns[0].username ) {
			$location.path('#/'+tag.campaigns[0].username+'/'+tag.tag );
		}
	}

	buildMarkerIcon = function(dateo) {
		var colors = [] 
		  , html
		  , catWidth
		;
		if ($scope.query.followFilter === 'follow') {
			angular.forEach(dateo.tags, function(tag){
				if (angular.isDefined($scope.homeSI.userTags[tag.tag])) {
					colors.push($scope.homeSI.userTags[tag.tag].color);
				}
			});
			if (colors.length == 0) colors.push(config.visualization.default_color);
		}else {
			colors.push(config.visualization.default_color);
		}
		catWidth = (29 / colors.length)
		
		html = '<svg width="29" height="40"><g style="clip-path: url(#pinpath);">';
		angular.forEach(colors, function (color, i) {
			html = html + '<rect height="40" width="'+catWidth+'" fill="'+color+'" x="'+(i*catWidth)+'" />';
		});
		html = html + '<circle class="datea-svg-marker-circle" data-datea-svg-circle-id="'+dateo.id+'" cx="14.5" cy="14" r="5" fill="white" />'
				 + '</g></svg>';

		return {
			  type        : 'div'
			, iconSize    : [29, 40]
			, iconAnchor  : [14.5, 40]
			, popupAnchor : [0, -33]
			, labelAnchor : [8, -25]
			, html        : html
			, className   : 'datea-pin-icon'
		}
	}

	/**************************************************
		CUSTOM MARKERCLUSTER ICONS: PIES
	***************************************************/

	selectClusterFunction = function (cluster) {
		if ($scope.query.followFilter === 'follow') {
			return buildPieClusterIcon(cluster);
		}
		return buildClusterIcon(cluster);
	}

	buildPieClusterIcon = function (cluster) {
		var children = cluster.getAllChildMarkers()
		  , n        = children.length
		  , d        = Piecluster.clusterSizeRange(children.length)
		  , di       = d + 1
		  , r        = d / 2
		  ,	dataObj  = {}
		  , data     = []
		  , html
		  , clusterIcon
		  ;

		angular.forEach(children, function (marker) {
			angular.forEach(marker.options._tags, function(tag) {
				// taking out the "other color" for tags not in secondar_tags
				//if (tag != $scope.campaign.main_tag.tag) {
				if (!!$scope.homeSI.userTags[tag]) {
					//tag = angular.isDefined($scope.subTags[tag]) ? tag : "Otros";
					if (angular.isDefined(dataObj[tag])) {
						dataObj[tag].value ++;
						dataObj[ tag ].ids.push( marker.options._id );
					}else{
						dataObj[tag] = { label: '#'+tag, value : 1, tag: tag, ids: [ marker.options._id ]};
					}
				}
			});
		});

		for (var j in dataObj) {
			data.push(dataObj[j]);
		}

		html = Piecluster.makeSVGPie(
		{ n             : n
		, r             : r
		, d             : d
		, data          : data
		, tags          : User.data.tags_followed
		, secondaryTags : $scope.homeSI.userTags
		});

		clusterIcon = new L.DivIcon(
		{ html      : html
		, className : Piecluster.pieclusterConfig.clusterIconClassName
		, iconSize  : new L.Point(di,di)
		} );

		return clusterIcon;
	}

	buildClusterIcon = function (cluster) {
		var children = cluster.getAllChildMarkers()
		  , n        = children.length
		  , d        = clusterSizeRange(children.length)
		  , di       = d + 1
		  , r        = d / 2
		  , dataObj  = {}
		  , data     = []
			, html
			, clusterIcon
		;

		// angular.forEach(children, function (marker) {
		// 	angular.forEach(marker.options._tags, function(tag) {
		// 		if (!!$scope.homeSI.userTags[tag]) {
		// 			if (angular.isDefined(dataObj[tag])) {
		// 				// dataObj[tag].value ++;
		// 				dataObj[ tag ].ids.push( marker.options._id );
		// 			}else{
		// 				dataObj[tag] = { label: '#'+tag, value : 1, tag: tag, ids: [ marker.options._id ]};
		// 			}
		// 		}
		// 	});
		// });

		// for (var j in dataObj) {
		// 	data.push(dataObj[j]);
		// }

		html = makeSVGClusterIcon({
				  n: n
				, r: r
				, d: d
				// , data : data
			});

		clusterIcon = new L.DivIcon({
			  html: html
			, className: 'marker-cluster'
			, iconSize: new L.Point(di,di)
		});

		return clusterIcon;
	}

	clusterSizeRange = d3.scale.linear()
		.domain([0, 100])
		.range([50, 80])
		.clamp(true); 

	makeSVGClusterIcon = function (opt) {
		var svg, vis, arc, pie, arcs;
		svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
		vis = d3.select(svg).data([opt.data])
			.attr( 'class', 'datea-svg-cluster' )
			.attr("width", opt.d)
			.attr("height", opt.d)
			.append("svg:g")
			.attr("transform", "translate(" + opt.r + "," + opt.r + ")");

		vis.append('circle')
			.attr("fill", config.visualization.default_color)
			.attr("r", opt.r)
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("opacity", 0.75);

		vis.append("circle")
			.attr("fill", "#ffffff")
			.attr("r", opt.r / 2.2)
			.attr("cx", 0)
			.attr("cy", 0);

		vis.append("text")
			.attr("x", 0)
			.attr("y", 0)
			.attr("class", "cpie-label")
			.attr("text-anchor", "middle")
			.attr("dy", '.3em')
			.text(opt.n);

		return serializeXmlNode(svg);
	}

	serializeXmlNode = function (xmlNode) {
		if (typeof window.XMLSerializer != "undefined") {
    	return (new window.XMLSerializer()).serializeToString(xmlNode);
		} else if (typeof xmlNode.xml != "undefined") {
    	return xmlNode.xml;
		}
    return "";
  }

	openSpiderfy = function () {
		var markerId
		  , sliceMarkerIds = []
		  , slicePosition
		  ;
		console.log( 'openSpiderfy', $scope.homeSI.leaflet.markers );
		markerId  = $( $scope.homeSI.leaflet.markers['marker'+lastMarkerWithFocus.replace('marker','')].icon.html ).find('circle').data('datea-svg-circle-id');
		// If there is no marker then it must be 'inside' the cluster
		if ( !$('[data-datea-svg-circle-id="'+markerId+'"]').length ) {
			// If multiples SVGs
			if ( $('[data-datea-svg-slice-id]').length > 1 ) {
				// Fill array with slice Ids
				$.each( $('[data-datea-svg-slice-id]'), function () {
					sliceMarkerIds.push( $(this).data('datea-svg-slice-id') );
				} );
				// Search for slice position to open
				$.each( sliceMarkerIds, function ( i,v ) {
					var idsBySlice = (v+'').split(',');
					!slicePosition && !!~idsBySlice.indexOf( markerId+'' ) && ( slicePosition = i );
				} );
				// Select slice and open marker-cluster parent
				$( $('[data-datea-svg-slice-id]').get( slicePosition ) ).parents('div.marker-cluster').click();
				console.log('slicePosition', slicePosition);
				slicePosition = null;
			} else {
				// Open marker-cluster parent
				$('[data-datea-svg-slice-id]').parents('div.marker-cluster').click();
				$('.datea-svg-cluster').parents('div.marker-cluster').click();
			}
		}
	};

  $scope.homeSI.leaflet.clusterOptions = { 
	  iconCreateFunction : selectClusterFunction
		//, disableClusteringAtZoom: 16
		, polygonOptions     : Piecluster.pieclusterConfig.polygonOptions
	};

	$scope.$on( 'leafletDirectiveMarker.click', function ( ev, args ) {
		console.log( 'focus event', args.markerName );
		lastMarkerWithFocus = args.markerName;
	} );

	$scope.$on('$destroy', function () {
		console.log( 'destroy' );
		$scope.homeSI = {};
		leafletMarkersHelpers.resetCurrentGroups();
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
