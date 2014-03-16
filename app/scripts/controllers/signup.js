'use strict';

angular.module('dateaWebApp')
.controller('SignupCtrl'
, [ '$scope'
  , 'User'
  , '$http'
  , '$location'
  , 'localStorageService'
  , 'Api'
, function (
    $scope
  , User
  , $http
  , $location
  , localStorageService
  , Api
) {

	var ls = localStorageService;

	$scope.flow = {};

	User.isSignedIn() && $location.path( '/' );

	$scope.flow.signIn = function () {
		$location.path( '/signin' );
	}

	$scope.flow.withFacebook = function () {
		OAuth.popup('facebook', function ( error, result ) {
			var partyGivens = {};
			partyGivens.access_token = result.access_token;
			partyGivens.party = 'facebook';
			User.signInBy3rdParty( partyGivens )
			.then( function ( response ) {
				$location.path( '/' );
			}, function ( reason ) {
				console.log( '$scope.flow.withFacebook', reason );
			} );
		});
	}

	$scope.flow.withTwitter = function () {
		OAuth.popup('twitter', function ( error, result ) {
			var partyGivens = {};
			partyGivens.party = 'twitter';
			partyGivens.oauth_token = result.oauth_token;
			partyGivens.oauth_token_secret = result.oauth_token_secret;
			User.signInBy3rdParty( partyGivens )
			.then( function ( response ) {
				$location.path( '/configuracion' );
			}, function ( reason ) {
				console.log( '$scope.flow.withTwitter', reason );
			} );
		});
	}

	$scope.flow.withEmail = function () {
		$location.path('/signup');
	}

} ] );
