'use strict';

angular.module('dateaWebApp')
.controller('ProfileCtrl'
, [ '$scope'
  , 'User'
  , 'config'
  , 'Api'
  , '$routeParams'
  , '$interpolate'
  , 'ActivityUrl'
  , 'ActivityTitle'
  , '$modal'
  , '$location'
  , 'shareMetaData'
  , '$timeout'
  , '$rootScope'
, function (
    $scope
  , User
  , config
  , Api
  , $routeParams
  , $interpolate
  , ActivityUrl
  , ActivityTitle
  , $modal
  , $location
  , shareMetaData
  , $timeout
  , $rootScope
) {

	var sup
	  // fn declarations
	  , buildUserInfo
	  , buildUserFollows
	  , buildUserDateos
	  , buildUserCampaigns
	  , buildPagination
	  , buildPaginationCampaigns
	  , buildPaginationDateos
	  , buildActivityLog
	  , buildActivityUrl
	  ;

	$scope.targetUser = {};
	$scope.targetUser.history = [];
	$scope.targetUser.dateo_loading = true;
	$scope.targetUser.campaign_loading = true;
	$scope.paginationCampaigns = {};
	$scope.paginationDateos = {};
	$scope.flow = {};
	$scope.flow.historyResults = 5;
	$scope.map_is_present = false;

	buildUserFollows = function () {
		Api.tag
		.getTags( { followed: $scope.targetUser.id } )
		.then( function ( response ) {
			$scope.targetUser.follows = response.objects;
		}, function ( reason ) {
			console.log( reason );
		} );
	}

	buildActivityLog = function () {
		$scope.targetUser.history = [];
		Api.activityLog
		.getActivityOfUserByUserId(
		{ user  : $scope.targetUser.id
		, mode  : 'actor'
		, limit : $scope.flow.historyResults
		} )
		.then( function ( response ) {
			$scope.flow.historyTotal = response.meta.total_count;
			angular.forEach( response.objects , function ( value, key ){
				value._url = ActivityUrl.parse( value );
				value._message = ActivityTitle.createTitle( value );
				$scope.targetUser.history.push( value );
			});
		} )
	}

	$scope.flow.showMoreHistory = function () {
		$scope.flow.historyResults += 5;
		buildActivityLog();
	}

	buildUserDateos = function ( givens ) {
		var index
		  , defaultQuery
		  ;
		$scope.targetUser.dateoLoading = true;
		index = givens && givens.index * config.profile.dateosOffset;
		defaultQuery = { limit         : config.profile.dateosOffset
		               , offset        : index || 0
		               , user_id       : $scope.targetUser.id
		               , with_redateos : true
		               }

		if (User.isSignedIn()  && User.data.id == $scope.targetUser.id) {
			defaultQuery.published = 'all';
		}

		Api.dateo
		.getDateos( defaultQuery )
		.then( function ( response ) {
			$scope.targetUser.dateos = response.objects;
			buildPaginationDateos( response );
			$scope.targetUser.dateoLoading = false;
		}, function ( reason ) {
			console.log( reason );
		} )
	}

	buildUserCampaigns = function ( givens ) {
		var index
		  , defaultQuery
		  ;
		$scope.targetUser.campaign_loading = true;
		index = givens && givens.index * config.profile.campaignsOffset;
		defaultQuery = { limit : config.profile.campaignsOffset
		               , offset : index || 0
		               , user : $routeParams.username
		               }

		if (User.isSignedIn() && User.data.id == $scope.targetUser.id) {
			defaultQuery.published = 'all';
		}

		Api.campaign
		.getCampaigns( defaultQuery )
		.then( function ( response ) {
			$scope.targetUser.campaigns = response.objects;
			buildPaginationCampaigns( response );
			$scope.targetUser.campaign_loading = false;
		}, function ( reason ) {
			console.log( reason );
		} )
	}

	buildUserInfo = function () {
		Api.user
		.getUserByUserIdOrUsername( { username : $routeParams.username } )
		.then( function ( response ) {
			var shareData;
			angular.extend($scope.targetUser, response);
			$scope.targetUser.isSameAsUser = $scope.targetUser.username === User.data.username;
			$scope.flow.notFound = false;
			$scope.flow.showRedateoAuthor = $scope.targetUser.username; 
			buildUserDateos();
			buildUserCampaigns();
			buildActivityLog();
			buildUserFollows();

			shareData = {
				  title       : "Perfil datero de "+$scope.targetUser.username
				, description : 'Chequea los dateos e iniciativas de '+$scope.targetUser.username+ ' en Datea. ¡Todos somos dateros!'
				, imageUrl    : ($scope.targetUser.image_large) ? config.api.imgUrl + $scope.targetUser.image_large : config.app.url + config.defaultImgProfile
			};
			shareMetaData.setData(shareData);
			$rootScope.htmlReady();

		}, function ( reason ) {
			console.log( 'user error reason:', reason );
			if ( reason.status === 404 ) {
				$location.path('/404');
			}
		} );
	}

	buildPaginationCampaigns = function( response ) {
		$scope.paginationCampaigns.totalItems = response.meta.total_count;
		$scope.paginationCampaigns.itemsPerPage = config.profile.paginationLimit;
	}

	$scope.$watch( 'paginationCampaigns.currentPage', function () {
		buildUserCampaigns( { index : $scope.paginationCampaigns.currentPage - 1 } );
	} );

	buildPaginationDateos = function ( response ) {
		$scope.paginationDateos.totalItems   = response.meta.total_count;
		$scope.paginationDateos.itemsPerPage = config.profile.paginationLimit;
	}

	$scope.targetUser.share = function () {
		$modal.open( { templateUrl : 'views/share.html'
		             , controller  : 'ShareCtrl'
		             , resolve     : {
		                 shareModalGivens : function () {
		                   return { url : $scope.targetUser.url }
		                 }
		             } } );
	}

	$scope.pageChanged = function () {
		buildUserDateos( { index : $scope.paginationDateos.currentPage - 1 } );
	};

	$scope.$on('user:hasDateado', function (event, args){
		if (args.created) {
			$scope.targetUser.dateos.unshift(args.dateo);
			$scope.targetUser.dateo_count++;
		}
	});

	$scope.$on('user:dateoDelete', function (event, args) {
		$scope.targetUser.dateo_count--;
		buildUserDateos();
	});

	if ( $routeParams.username ) {
		buildUserInfo();
	}

} ] );
