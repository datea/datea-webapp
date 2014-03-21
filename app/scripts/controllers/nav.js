'use strict';

angular.module('dateaWebApp')
.controller('NavCtrl'
, [ '$scope'
  , 'User'
  , '$rootScope'
  , '$modal'
  , '$location'
  , 'localStorageService'
, function (
    $scope
  , User
  , $rootScope
  , $modal
  , $location
  , localStorageService
) {
	// fn declarations
	var onSignIn
	  , updateUserDataFromApi
	  ;

	$scope.nav  = {};
	$scope.user = {};
	$scope.nav.visible = User.isSignedIn();

	$scope.nav.isCollapsed = true;
	$scope.alerts = []

	updateUserDataFromApi = function () {
		var ls = localStorageService
		  , updatedData
		  , currentData = ls.get('user')
		  ;

		User.getData( { username: currentData.username} )
		.then( function ( response ) {
			updatedData = response;
			angular.extend(currentData, updatedData);
			ls.set( 'user', currentData );
			User.updateUserDataFromStorage();
console.log( 'updateUserDataFromApi', response );
			if ( User.data.status === 0 ) {
console.log( 'updateUserDataFromApi', 'status === 0' );
				$location.path( '/configuracion' );
				$scope.addAlert( { type : 'danger'
				                 , msg  : 'Por favor indique su correo para terminar el registro'
				                 } );
			} else {
				$location.path( '/' );
			}

		}, function ( reason ) {
			console.log( reason );
		} );
	}

	onSignIn = function ( givens ) {
		User.updateUserDataFromStorage();
		$scope.nav.visible = User.isSignedIn();
		$scope.user = User.data;
		if ( User.data.status === 0 ) {
			updateUserDataFromApi();
		}
	}

	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.addAlert = function ( givens ) {
		$scope.alerts = [];
		$scope.alerts.push( givens );
	}

	$rootScope.$on( 'user:signedIn', function ( event, error ) {
		onSignIn();
	} );

	$rootScope.$on( 'user:signedOut', function ( event, error ) {
		$scope.nav.visible = User.isSignedIn();
	} );

	$rootScope.$on( 'user:hasDateado', function ( event, error ) {
		updateUserDataFromApi();
	} );

	$scope.$on( '$locationChangeStart', function ( scope, next, current ){
		User.updateUserDataFromStorage();
		onSignIn();
	});

	$rootScope.$on( 'error:someError', function () {
		console.log( 'hubo un error http' );
	} )


	$scope.nav.signIn = function () {
		$location.path( '/signin' );
	}

	$scope.nav.signOut = function () {
		User.signOut();
	}

	$scope.nav.datear = function () {
		$modal.open( { templateUrl : 'views/datear.html'
		             , controller  : 'DatearCtrl'
		             , windowClass : 'datear-modal'
		             , resolve     : {
		                datearModalGivens : function () {
		                 	return {};
		                 }
		               }
		             } )
	}

	if ( User.isSignedIn() ) {
		onSignIn();
	}

	// $scope.nav.datear();

}]);
