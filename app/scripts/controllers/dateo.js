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
	$scope.dateo.messageNext = '';

	hasNext = function () {
		var idx = dateosId.indexOf( +dateo.id );
		return !!~idx && dateosId.length - 1 > idx;
	}

	buildDateo = function ( response ) {
		dateos = response.objects;
		console.log( 'otros dateosId:' )
		angular.forEach( dateos, function ( value, key ) {
			console.log( value.id );
			dateosId.push( value.id );
		} );
		// find in response
		angular.forEach( dateos, function ( value, key ) {
			var leaflet = {};
			if ( value.id === +$routeParams.dateoId ) {

				leaflet.center = { lat  : value.position.coordinates[1]
				                 , lng  : value.position.coordinates[0]
				                 , zoom : 14
				                 }
				leaflet.markers = { staticy : { lat       : value.position.coordinates[1]
				                              , lng       : value.position.coordinates[0]
				                              , draggable : false
				                              } }
				dateo = value;
				angular.extend( $scope.dateo, value );
				angular.extend( $scope, leaflet )
				$scope.dateo.messageNext = hasNext() ? 'siguiente' : 'primer';
			}
		});
		// not found
		if ( !$scope.dateo.content ) {
			$scope.dateo.message = 'no encontrado';
		}
	}

	$scope.dateo.nextDateo = function () {
		var idx = dateosId.indexOf( +dateo.id );
		if ( !!~idx && dateosId.length - 1 > idx ) {
			$location.path( '/' + $routeParams.userName + '/dateos/' + dateosId[ idx + 1 ] );
		} else {
			$location.path( '/' + $routeParams.userName + '/dateos/' + dateosId[ 0 ] );
		}
	}

	$scope.dateo.imgDetail = function ( img ) {
		$modal.open( { templateUrl : 'views/dateo-detail-img.html'
		             , controller  : 'DateoimgCtrl'
		             , resolve     : {
		                 img : function () {
		                   return img;
		                 }
		               }
		             } )
	}

	$scope.dateo.print = function () {
		$window.print();
	}

	Api.dateo
	.getDateoByUsername( $routeParams.userName )
	.then( buildDateo );

	angular.extend( $scope, config.defaultMap );

}]);
