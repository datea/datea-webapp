'use strict';

angular.module( 'dateaWebApp' )
.controller( 'MainCtrl'
, [ 'User'
	, '$scope'
	, '$http'
	, '$location'
	, 'wxBirdangularService'
	, 'localStorageService'
	, '$window'
	, 'Facebook'
, function ( User
	, $scope
	, $http
	, $location
	, wxBirdangularService
	, localStorageService
	, $window
	, Facebook
	) {

	var ba = wxBirdangularService
	  , ls = localStorageService
	  ;

	$scope.flow = {};

	$scope.$watch( function () {
		return Facebook.isReady();
	}, function ( val ) {
		$scope.flow.facebookReady = true;
	} )

	$scope.flow.withTwitter = function () {
		ba.requestToken();
		$window.$windowScope = $scope;
	}

	$scope.flow.withFacebook = function () {
		Facebook.getLoginStatus( function ( response ) {
			if ( response.status === 'connected' ) {
				$location.path( '/signup' );
			} else {
				Facebook.login( function ( response ) {
					ls.set( 'keys-facebook', response );
					$location.path( '/signup' );
				} );
			}
		} );
	}

	$scope.flow.withEmail = function () {
		$location.path('/signup');
	}

	$scope.flow.onCallback = function () {
		$scope.$apply( function () {
			$location.path('/signup');
		} );
	}

} ] );
