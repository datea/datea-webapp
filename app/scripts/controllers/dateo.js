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
, function (
    $scope
  , $routeParams
  , Api
  , config
  , $location
  , $modal
  , $window
 ) {
	var dateos
	  , dateosId = []
	  , dateo
	  , staticMap
	  // fn declarations
	  , buildDateo
	  , updateComments
	  , hasNext
	  ;

	$scope.dateo = {};
	$scope.dateo.form = {};
	$scope.dateo.leaflet = {};
	$scope.dateo.messageNext = '';

	hasNext = function () {
		return dateo.id < dateo.next_by_user;
	}

	buildDateo = function ( response ) {
		var leaflet = {};
		if( response.objects[0] ) {
			dateo   = response.objects[0];
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
		} else {
			$scope.dateo.message = 'error no encontrado';
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

	if ( $routeParams.username && $routeParams.dateoId ) {
			Api.dateo
			.getDateoByUsernameAndDateoId(
			{ user : $routeParams.username
			, id   : +$routeParams.dateoId
			} )
			.then( buildDateo );
			angular.extend( $scope.dateo.leaflet, config.defaultMap );
	}

} ] );
