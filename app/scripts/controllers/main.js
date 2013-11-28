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
, function ( User
	, $scope
	, $http
	, $location
	, wxBirdangularService
	, localStorageService
	, $window
	) {

	var ba = wxBirdangularService
	  , ls = localStorageService
	  ;

	$scope.flow = {};

	$scope.flow.withTwitter = function () {
		ba.requestToken();
		$window.$windowScope = $scope;
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
