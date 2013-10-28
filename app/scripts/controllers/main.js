'use strict';

angular.module( 'dateaWebApp' )
	.controller( 'MainCtrl', [ 'User', '$scope', '$http',
		function ( User, $scope, $http ) {

		$scope.datea = {};
		$scope.auth  = {};
		// datea-api endpoint -- now called from User service
		// $scope.auth.url   = 'http://192.168.1.37:8000/api/v2/create_user/';
		$scope.datea.name = 'Datea.pe';

		$scope.auth.save = function () {
			var data
			  , isValid
			  ;

			isValid = $scope.form.$valid;

			data = { bio        : $scope.auth.bio
			       , email      : $scope.auth.email
			       , password   : $scope.auth.password
			       , twitter_id : $scope.auth.twitterId }

			if ( isValid ) {
				$scope.auth.message = null;
				$scope.auth.message = "call api";
				User.post( data, function ( response ) {
					console.log( response );
					$scope.auth.message = 'api called';
				} );
			} else {
				$scope.auth.message = 'please check your inputs';
			}

			// Now in User service
			// $http.post( $scope.auth.url, data )
			// .success( function ( response ) {
			// 	console.log( response );
			// } );
		}

	} ] );
