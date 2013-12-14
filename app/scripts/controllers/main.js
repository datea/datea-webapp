'use strict';

angular.module( 'dateaWebApp' )
.controller( 'MainCtrl'
, [ 'User'
  , '$scope'
  , '$http'
  , '$location'
  , 'wxBirdangularService'
  , 'localStorageService'
  , '$rootScope'
, function (
	  User
  , $scope
  , $http
  , $location
  , wxBirdangularService
  , localStorageService
  , $rootScope
	) {

	var ba = wxBirdangularService
	  , ls = localStorageService
	  ;

	$scope.flow = {};

	$scope.flow.visible = !User.isSignedIn;

	$scope.flow.signIn = function () {
		User.signIn();
	}

	$scope.flow.signUp = function () {
		$location.path( '/registrate' );
	}

	$rootScope.$on( 'user:signedIn', function () {
		$scope.flow.visible = false;
	} );

	$rootScope.$on( 'user:signedOut', function () {
		$scope.flow.visible = true;
	} );

} ] );
