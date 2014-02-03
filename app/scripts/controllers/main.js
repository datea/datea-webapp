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
) {
	var data
	  , ls    = localStorageService
	  , dateo = {}
	  , campaigns = []
	  // fn declarations
	  , onSignIn
	  , onSignUp
	  , onSignOut
	  , onGeolocation
	  , onGeolocationError
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
		var dateosGivens = {}
			, center       = {}
			, map
			;

		center.lat = givens && givens.center && givens.center.coords.latitude;
		center.lng = givens && givens.center && givens.center.coords.longitude;

		map = config.defaultMap;
		map.center.zoom = 15;
		if ( center.lat && center.lng ) {
			map.center.lat = center.lat;
			map.center.lng = center.lng
		}

		dateosGivens.latitude  = center.lat || config.defaultMap.center.lat;
		dateosGivens.longitude = center.lng || config.defaultMap.center.lng;
		dateosGivens.distance  = 2000;

		angular.extend( $scope, map );

		$scope.$watch( 'center.lat+center.lng', function () {
			buildMarkers( { latitude : $scope.center.lat
			              , longitude: $scope.center.lng
			              , distance : 2000
			              }	)
		} )

		buildMarkers( dateosGivens );
	}

	buildMarkers = function ( givens ) {
		var map     = {}
		  , markers = {}
		  ;
		givens.limit = 50;
		Api.dateo.getDateos( givens )
		.then( function ( response ) {
			angular.forEach( response.objects, function ( value, key ){
				if ( value.position ) {
					markers['marker'+key] = { lat : value.position.coordinates[1]
					                        , lng : value.position.coordinates[0]
					                        , message : value.content
					                        , draggable : false
					                        }
				}
			});
			map.markers = markers;
			angular.extend( $scope, map );
		}, function ( reason ) {
			console.log( reason );
		} );
	}

	onSignIn =function () {
		$scope.flow.isSignedIn = false;
		$scope.user = User.data;

		angular.extend( $scope, config.defaultMap );
		geo.getLocation( { timeout:10000 } )
		.then( function ( data ) {
			buildMap( { center : data } )
		}, function () {
			buildMap();
		} )

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
