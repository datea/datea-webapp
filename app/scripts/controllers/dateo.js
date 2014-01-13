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
	  , hasNext
	  ;

	$scope.dateo = {};
	$scope.dateo.form = {};
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
			angular.extend( $scope, leaflet );
		} else {
			$scope.dateo.message = 'error no encontrado';
		}
	}

	$scope.dateo.nextDateo = function () {
		$location.path( '/' + $routeParams.userName + '/dateos/' + dateo.next_by_user );
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

	Api.dateo
	.getDateoByUsernameAndDateoId(
	{ user : $routeParams.userName
	, id   : +$routeParams.dateoId
	} )
	.then( buildDateo );

	$scope.dateo.postComment = function () {
		var comment = {};
		comment.comment      = $scope.dateo.form.comment;
		comment.object_id    = $scope.dateo.id;
		comment.content_type = 'dateo';
		Api.comment
		.postCommentByDateoId( comment )
		.then( function ( response ) {
			console.log( response )
			// update view
		} )
	}

	angular.extend( $scope, config.defaultMap );

} ] );
