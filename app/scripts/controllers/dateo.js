'use strict';

angular.module('dateaWebApp')
.controller('DateoCtrl'
, [ '$scope'
  , '$routeParams'
  , 'Api'
  , 'config'
  , '$location'
  , '$modal'
  , '$window'
  , 'User'
  , 'leafletData'
  , '$timeout'
, function (
    $scope
  , $routeParams
  , Api
  , config
  , $location
  , $modal
  , $window
  , User
  , leafletData
  , $timeout
 ) {
	var dateos
	  , dateosId = []
	  , dateo
	  // fn declarations
	  , buildDateo
	  , updateComments
	  , hasNext
	  , hasUserVoted
	  ;

	$scope.dateo             = {};
	$scope.dateo.form        = {};
	$scope.dateo.leaflet     = {};
	$scope.dateo.messageNext = '';
	$scope.flow              = {};
	$scope.flow.notFound     = true;

	$scope.dateo.isUserSignedIn = User.isSignedIn();

	hasUserVoted = function () {
		Api.vote
		.getVotes( { user : User.data.id, vote_key : 'dateo.'+$scope.dateo.id } )
		.then( function ( response ) {
			console.log( 'hasUserVoted', response );
			$scope.dateo.hasVoted = response.meta.total_count ? true : false;
		}, function ( reason ) {
			console.log( reason );
		} )
	}

	hasNext = function () {
		return dateo.id < dateo.next_by_user;
	}

	buildDateo = function ( response ) {
		var leaflet = {};
		if( response.objects[0] ) {
			dateo   = response.objects[0];
			$scope.flow.notFound = false;
			leaflet.center = { lat  : dateo.position.coordinates[1]
			                 , lng  : dateo.position.coordinates[0]
			                 , zoom : 14
			                 }
			leaflet.markers = { staticy : { lat       : dateo.position.coordinates[1]
			                              , lng       : dateo.position.coordinates[0]
			                              , draggable : false
			                              } }
			$scope.dateo.messageNext = hasNext() ? 'siguiente' : 'primer';
			angular.extend( $scope.dateo, dateo );
			angular.extend( $scope.dateo.leaflet, leaflet );
			$scope.dateo.shareableUrl = config.app.url + $scope.dateo.user.username + '/dateos/' + $scope.dateo.id;
			hasUserVoted();
			leafletData.getMap('leafletDateo').then( function ( map ) {
				$timeout( function () {
					map.invalidateSize();
				}, 200 );
			});
			console.log( 'buildDateo', dateo );
		} else {
			$scope.flow.notFound = true;
		}
	}

	updateComments = function ( response ) {
		if ( !$scope.dateo.comments ) {
			$scope.dateo.comments = {};
		}
		angular.extend( $scope.dateo.comments, response.objects[0].comments );
	}

	$scope.dateo.nextDateo = function () {
		$location.path( '/' + $routeParams.username + '/dateos/' + dateo.next_by_user );
	}

	$scope.dateo.imgDetail = function ( img ) {
		var givens;

		givens = { templateUrl : 'views/dateo-detail-img.html'
		         , controller  : 'DateoimgCtrl'
		         , resolve     : {
		             img : function () {
		               return img;
		             }
		           }
		         }

		$modal.open( givens );
	}

	$scope.dateo.print = function () {
		$window.print();
	}

	$scope.dateo.postComment = function () {
		var comment = {};
		comment.comment      = $scope.dateo.form.comment;
		comment.object_id    = $scope.dateo.id;
		comment.content_type = 'dateo';
		Api.comment
		.postCommentByDateoId( comment )
		.then( function ( response ) {
			console.log( response )
			Api.dateo
			.getDateoByUsernameAndDateoId(
			{ user : $routeParams.username
			, id   : +$routeParams.dateoId
			} )
			.then( updateComments );
		} )
	}

	$scope.dateo.doVote = function () {
		if ( $scope.dateo.isUserSignedIn ) {
			Api.vote
			.doVote( { content_type: 'dateo', object_id: $scope.dateo.id } )
			.then( function ( response ) {
				console.log( 'doVote', response );
				Api.dateo
				.getDateoByUsernameAndDateoId(
				{ user : $routeParams.username
				, id   : +$routeParams.dateoId
				} )
				.then( buildDateo );
			}, function ( reason ) {
				console.log( reason );
			} );
		} else {
			$location.path('/registrate');
		}

	}

	$scope.dateo.share = function () {
		$modal.open( { templateUrl: 'views/share.html'
		             , controller : 'ShareCtrl'
		             , resolve    : {
		                 shareModalGivens : function () {
		                 	return { url : $scope.dateo.shareableUrl }
		                 }
		             } } );
	}

	$scope.dateo.denounce = function ( type, ev ) {
		Api.flag
		.doFlag( { content_type : type
		         , object_id    : +$routeParams.dateoId } )
		.then( function ( response ) {
			console.log( 'flag', type, +$routeParams.dateoId )
			$( ev.target ).hide();
		}, function ( reason ) {
			console.log( reason );
		} );
	}

	if ( $routeParams.username && $routeParams.dateoId ) {
			Api.dateo
			.getDateoByUsernameAndDateoId(
			{ user : $routeParams.username
			, id   : +$routeParams.dateoId
			} )
			.then( buildDateo, function ( reason ) {
				if ( reason.status === 404 ) {
					$scope.$apply( function () {
						$scope.flow.notFound = true;
					} );
					console.log( 'usuario no encontrado' );
				}
			} );
			angular.extend( $scope.dateo.leaflet, config.defaultMap );
	}

} ] );
