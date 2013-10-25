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

			data = { bio        : $scope.auth.bio
			       , email      : $scope.auth.email
			       , password   : $scope.auth.password
			       , twitter_id : $scope.auth.twitterId }

			// Weak validation, TODO fix with a directive
			isValid = data.bio && data.email && (function ( pwd ) {
				return pwd && /(.{4,})/.test( pwd );
			})( data.password ) && data.twitter_id;

			if ( isValid ) {
				$scope.auth.message = null;
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
