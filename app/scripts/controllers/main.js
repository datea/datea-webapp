'use strict';

angular.module( 'dateaWebApp' )
	.controller( 'MainCtrl', [ '$scope', '$http', function ( $scope, $http ) {

		$scope.datea = {};
		$scope.auth  = {};
		// datea-api endpoint
		$scope.auth.url   = 'http://192.168.1.37:8000/api/v2/create_user/';
		$scope.datea.name = 'Datea.pe';

		$scope.auth.save = function () {
			var data
			  , isValid
			  ;

			data = { bio        : $scope.auth.bio
			       , email      : $scope.auth.email
			       , password   : $scope.auth.password
			       , twitter_id : $scope.auth.twitterId }

			isValid = data.bio && data.email && (function ( pwd ) {
				return pwd && /(.{4,})/.test( pwd );
			})( data.password ) && data.twitter_id;

			if ( isValid ) {
				$scope.auth.message = null;
			} else {
				$scope.auth.message = 'please check your inputs';
			}

			// $http.post( $scope.auth.url, data )
			// .success( function ( response ) {
			// 	console.log( response );
			// } );
		}

	} ] );
