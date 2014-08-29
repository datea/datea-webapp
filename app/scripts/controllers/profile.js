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
  , '$modal'
  , '$location'
  , 'shareMetaData'
, function (
    $scope
  , User
  , config
  , Api
  , $routeParams
  , $interpolate
  , ActivityUrl
  , $modal
  , $location
  , shareMetaData
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
	$scope.flow.notFound = false;
	$scope.map_is_present = false;

	buildUserFollows = function () {
		Api.tag
		.getTags( { followed: User.data.id } )
		.then( function ( response ) {
			console.log( 'targetUser follow', response );
			$scope.targetUser.follows = response.objects;
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
				return !!~config.activityLog.activityVerbs.indexOf( value.verb );
			} );
			angular.forEach( activityLog, function ( value, key ){
				value._url = ActivityUrl.parse( value );
				value._message = $interpolate( config.activityLog.activityContentMsg.byUser[ value.verb ] )(value);
				console.log( '$scope.targetUser', $scope.targetUser );
				$scope.targetUser.history.push( value );
			});
		} )
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
			console.log("PROFILE DATEOS", response );
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
			console.log( 'buildUserCampaigns', response.objects );
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
			//console.log( 'user info', response);
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

		}, function ( reason ) {
			console.log( 'user error reason:', reason );
			if ( reason.status === 404 ) {
				$scope.$apply( function () {
					$scope.flow.notFound = true;
				} );
				console.log( 'usuario no encontrado' );
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
		console.log("PAGE", $scope.paginationDateos.currentPage);
		buildUserDateos( { index : $scope.paginationDateos.currentPage - 1 } );
	}


	if ( $routeParams.username ) {
		buildUserInfo();
	}

} ] );
