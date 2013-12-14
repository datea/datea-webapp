'use strict';

angular.module('dateaWebApp')
.controller('NavCtrl'
, [ '$scope'
  , 'User'
  , '$rootScope'
  , '$modal'
, function (
    $scope
  , User
  , $rootScope
  , $modal
) {

	$scope.nav = {};
	$scope.nav.visible = User.isSignedIn;

	$scope.nav.isCollapsed = true;

	$rootScope.$on( 'user:signedIn', function ( event, error ) {
		$scope.nav.visible = User.isSignedIn;
	} )

	$rootScope.$on( 'user:signedOut', function ( event, error ) {
		$scope.nav.visible = User.isSignedIn;
	} )

	$scope.nav.signOut = function () {
		User.signOut();
	}

	$scope.nav.datear = function () {
		$modal.open( { templateUrl : 'views/datear.html'
		             , controller  : 'DatearCtrl'
		             } )
	}

}]);
