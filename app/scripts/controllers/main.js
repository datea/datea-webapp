'use strict';

angular.module( 'dateaWebApp' )
	.controller( 'MainCtrl', [ '$scope', '$http', function ( $scope, $http ) {

		$scope.datea = {};
		$scope.auth  = {};
		// datea-api endpoint
		$scope.auth.url   = 'http://192.168.1.37:8000/api/v2/create_user/';
		$scope.datea.name = 'Datea.pe';

		$scope.auth.save = function () {
			var data;

			data = { bio        : $scope.auth.bio
			       , email      : $scope.auth.email
			       , password   : $scope.auth.password
			       , twitter_id : $scope.auth.twitterId }


			$http.post( $scope.auth.url, data )
			.success( function ( response ) {
				console.log( response );
			} );
		}

	} ] );
