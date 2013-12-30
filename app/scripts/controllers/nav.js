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
	$scope.alerts = [ { type : 'success'
	                  , msg  : 'Bienvenido usuario, hoy es ' + new Date()
	                  }
	                ]

	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};

	$rootScope.$on( 'user:signedIn', function ( event, error ) {
		$scope.nav.visible = User.isSignedIn;
	} )

	$rootScope.$on( 'user:signedOut', function ( event, error ) {
		$scope.nav.visible = User.isSignedIn;
	} )

	$scope.nav.signIn = function () {
		User.signIn();
	}

	$scope.nav.signOut = function () {
		User.signOut();
	}

	$scope.nav.datear = function () {
		$modal.open( { templateUrl : 'views/datear.html'
		             , controller  : 'DatearCtrl'
		             } )
	}

}]);
