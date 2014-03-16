'use strict';

angular.module('dateaWebApp')
.controller('SignupformCtrl',
[ '$scope'
, '$http'
, 'localStorageService'
, 'Api'
, 'config'
, '$location'
, 'User'
, function (
  $scope
, $http
, localStorageService
, Api
, config
, $location
, User
) {

	var ls = localStorageService
	  ;

	$scope.datea = {};
	$scope.auth  = {};

	User.isSignedIn() && $location.path( '/' );

	$scope.auth.save = function () {
		var data
		  , isValid
		  ;

		isValid = $scope.form.$valid;

		data = { username             : $scope.auth.bio
		       , email                : $scope.auth.email
		       , password             : $scope.auth.password
		       , success_redirect_url : config.app.url + 'updateUser'
		       , error_redirect_url   : config.app.url
		       }

		if ( isValid ) {
			Api.account.register.createUser( data )
			.then( function ( response ) {
				console.log( response )
				if ( response.status === 201 ) {
					ls.set( 'user', response.user );
					$location.path( '/signin' );
				}
			}
			, function ( reason ) {
				console.log( reason );
			} )
		} else {
			$scope.auth.message = 'please check your inputs';
		}

	}

} ] );
