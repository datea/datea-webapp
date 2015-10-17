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
  , 'Fullscreen'
  , 'ActivityTitle'
  , 'ActivityUrl'
  , '$timeout'
  , 'State'
  , 'leafletBoundsHelpers'
  , 'leafletMarkersHelpers'
  , 'Piecluster'
  , '$compile'
  , 'shareMetaData'
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
  , Fullscreen
  , ActivityTitle
  , ActivityUrl
  , $timeout
  , State
  , leafletBoundsHelpers
  , leafletMarkersHelpers
  , Piecluster
  , $compile
  , shareMetaData
) {
	var data
	  , ls = localStorageService
	  , dateo             = {}
	  , campaigns         = []
	  , queryCache	      = {}
	  , userStatusOnInit
	  // fn declarations
	  , onSignIn
	  , onSignUp
	  , onSignOut
	  , buildCampaigns
	  , buildCampaignsFollowed
	  , buildPagination
	  , buildActivityLog
	  , buildActivityUrl
	  , buildFollowingTags
	  , buildTrendingTags
	  , initHomeSIScope
	;

	$scope.flow           = {};
	$scope.query          = {};
	$scope.pagination     = {};

	$scope.query.orderBy            = '-created';
	//$scope.query.orderByLabel       = 'últimos';
	//$scope.query.followFilter       = 'all';
	//$scope.query.followFilterLabel  = 'todos';
	$scope.flow.historyResults      = 5;

	$scope.dateFormat = config.defaultDateFormat;

	initHomeSIScope = function () {
		$scope.homeSI                   = {};
		$scope.homeSI.history           = [];
		$scope.homeSI.loading           = {};
		$scope.homeSI.loading.campaigns = true;
		$scope.homeSI.userTagsArray     = [];
		$scope.homeSI.activeTab 			  = 'dateos';
		$scope.homeSI.dateosListView    = {limit: 20};
		$scope.flow.campaignTabs        = {'following': false, 'featured': true};
		$scope.homeSI.campaignsFollowed = [];
	} 

	initHomeSIScope();
	shareMetaData.resetToDefault();

	// $scope.homeSI.leaflet = { bounds   : [ [ -12.0735, -77.0336 ], [ -12.0829, -77.0467 ] ]
	//                , center   : { lat: -12.05, lng: -77.06, zoom: 13 }
	//                , defaults : { scrollWheelZoom: false }
	//                , markers  : {}
	//                }

	buildFollowingTags = function () {
		Api.tag
		.getTags( { followed: User.data.id } )
		.then( function ( response ) {
			$scope.homeSI.userTags = {};
			$scope.homeSI.followingTags = response.objects.map( function (t, i) {
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
				$scope.homeSI.trendingTags.push( value );
			} );
		} );
	}

	buildActivityLog = function () {
		Api.activityLog
		.getActivityOfUserByUserId(
		{ user  : User.data.id
		, mode  : 'all'
		, limit : $scope.flow.historyResults
		} )
		.then( function ( response ) {
			$scope.homeSI.history = [];
			$scope.flow.historyTotal = response.meta.total_count;
			angular.forEach( response.objects, function ( value, key ){
				value._url = ActivityUrl.parse( value );
				value._message = ActivityTitle.createTitle( value );
				$scope.homeSI.history.push( value );
			});
		} )
	}

	$scope.flow.showMoreHistory = function () {
		$scope.flow.historyResults += 5;
		buildActivityLog();
	} 

	buildCampaigns = function ( givens ) {
		var totalCount
		  , index
		  , query
		  , defaultQuery
		  ;

		index = givens && givens.index * config.homeSI.campaignsOffset;
		defaultQuery = { order_by   : '-featured,-created'
									 , is_active : true
		               , limit      : config.homeSI.campaignsOffset
		               , offset     : index || 0
		               }
		query = givens && givens.query || defaultQuery;

		Api.campaign
		.getCampaigns( query )
		.then( function ( response ) {
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

	$scope.flow.searchDateos = function() {
		if ($scope.query.search && $scope.query.search.match(/^#\S+$/)) {
			console.log('/tag/'+$scope.query.search.replace('#', ''));
			$location.path('/tag/'+$scope.query.search.replace('#', ''));
		}else{
			$location.path('/buscar/'+$scope.query.search);
		}
	}

	onSignIn = function () {
		var map
		  , bounds
		  , nextURL
		  ;

		nextURL = ls.get( 'nextURL' );
		if ( nextURL && nextURL.count === 0 ) {
			$timeout( function () {
				nextURL.count = nextURL.count + 1;
				ls.set( 'nextURL', nextURL );
				$location.path( nextURL.path );
			} );
			return;
		} else {
			State.isLanding             = false;
			$scope.flow.isSignedIn      = false;
			$scope.user                 = User.data;

			if (User.data.tags_followed.length) {
				$scope.query.followFilter       = 'follow';
		  	$scope.query.followFilterLabel  = 'lo que sigo';
			}
			$scope.homeSI.userTags = {};
			$scope.homeSI.followingTags = User.data.tags_followed.map(function (t, i) { 
				$scope.homeSI.userTags[t.tag] = t;
				return t;
			});
			
			if (User.data.tags_followed.length) {
				$scope.flow.campaignTabs = {following: true, featured: false};
			}
			buildCampaigns();
			buildCampaignsFollowed();
			buildActivityLog();
			buildTrendingTags();
			buildFollowingTags();
		}
	}

	onSignUp = function () {
		onSignIn();
	}

	onSignOut = function () {
		State.isLanding = true;
		$scope.flow.isSignedIn = true;
	}

	$scope.flow.isSignedIn = !User.isSignedIn();

	$scope.flow.datear = function () {
		$modal.open( { templateUrl : 'views/datear.html'
		             , controller  : 'DatearCtrl'
		             , windowClass : 'datear-modal'
		             , backdrop    : 'static'
		             , resolve     : {
		                datearModalGivens : function () {
		                   return {};
		                  }
		                }
		            } );
	}

	$scope.homeSI.autocompleteSearch = function ( val ) {
	if (!val) return;
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
		$scope.homeSI.loading.campaigns = true;
		if ( $scope.homeSI.searchCampaignsKeyword ) {
			buildCampaigns( { query :
			{ q      : $scope.homeSI.searchCampaignsKeyword
			, limit  : config.homeSI.campaignOffset
			, offset : 0 } }
			);
		} else {
			buildCampaigns();
		}
	}

	$scope.$on('$destroy', function () {
		initHomeSIScope();
		leafletMarkersHelpers.resetCurrentGroups();
	});

	$rootScope.$on( 'user:signedIn', function () {
		if (User.data.status === 1) onSignIn();
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

	userStatusOnInit = User.data.status;

	if( User.isSignedIn() && User.data.status === 1) {
		onSignIn();
	}

} ] );
