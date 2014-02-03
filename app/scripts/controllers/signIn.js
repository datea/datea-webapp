'use strict';

angular.module( 'dateaWebApp' )
.controller( 'SigninCtrl'
, [ '$scope'
  , 'Api'
  , 'localStorageService'
  , 'User'
  , '$location'
, function (
    $scope
  , Api
  , localStorageService
  , User
  , $location
) {
	var ls = localStorageService;
	$scope.auth = {};
	$scope.flow = {};
	$scope.reset = {};

	$scope.auth.signIn = function () {
		var isValid
		  , data
		  ;
		isValid = $scope.form.$valid;

		data = { username : $scope.auth.username
		       , password : $scope.auth.password }

		if ( isValid ) {
			User.signIn( data )
			.then( function ( response ) {
				User.updateUserDataFromStorage();
				$location.path('/');
			} );
		}
	}

	$scope.auth.withFacebook = function () {
		OAuth.popup('facebook', function ( error, result ) {
			var partyGivens = {};
			partyGivens.access_token = result.access_token;
			partyGivens.party = 'facebook';
			User.signInBy3rdParty( partyGivens )
			.then( function ( response ) {
				console.log( response );
				$location.path( '/#' );
			}, function ( reason ) {
				console.log( reason );
			} );
		});
	}

	$scope.auth.withTwitter = function () {
		OAuth.popup('twitter', function ( error, result ) {
			var partyGivens = {};
			partyGivens.party = 'twitter';
			partyGivens.oauth_token = result.oauth_token;
			partyGivens.oauth_token_secret = result.oauth_token_secret;
			User.signInBy3rdParty( partyGivens )
			.then( function ( response ) {
				console.log( 'auth.withTwitter', 'updateUserDataFromStorage' );
				if ( response.status === 0 ) {
					$location.path( '/perfil' );
				} else {
					$location.path( '/' );
				}

			}, function ( reason ) {
				console.log( 'auth.withTwitter error', reason );
			} );
		});
	}

	$scope.auth.resetPassword = function () {
		var resetGivens = {};
		resetGivens.email = $scope.reset.email;
		User.resetPassword( resetGivens );
	}


} ] );
