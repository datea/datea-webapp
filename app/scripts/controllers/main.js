'use strict';

angular.module( 'dateaWebApp' )
.controller( 'MainCtrl'
, [ '$scope'
  , 'User'
  , '$http'
  , '$location'
  , '$rootScope'
  , 'config'
  , 'localStorageService'
, function (
    $scope
  , User
  , $http
  , $location
  , $rootScope
  , config
  , localStorageService
) {
	var data
	  , ls    = localStorageService
	  , dateo = {}
	  , headers
	  // fn declarations
	  , onSignIn
	  , onSignUp
	  ;

	onSignIn =function () {
		$scope.flow.visible = false;
		$scope.user = User.data;
	}

	onSignUp = function () {
		onSignIn();
	}

	$scope.flow = {};

	$scope.flow.visible = !User.isSignedIn();

	$scope.flow.signIn = function () {
		$location.path( '/signin' );
	}

	$scope.flow.signUp = function () {
		$location.path( '/registrate' );
	}

	$rootScope.$on( 'user:signedIn', function () {
		onSignIn();
	} );

	$rootScope.$on( 'user:signedOut', function () {
		$scope.flow.visible = true;
	} );

	$rootScope.$on( 'user:signedUp', function () {
		console.log( 'user:signedUp' );
		onSignUp();
	} );

	if( User.isSignedIn() ) {
		onSignIn();
	}

} ] );
