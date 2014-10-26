'use strict';

angular.module('dateaWebApp')
.controller('NavCtrl'
, [ '$scope'
  , 'User'
  , '$rootScope'
  , '$modal'
  , '$location'
  , 'localStorageService'
  , 'State'
  , '$timeout'
  , '$window'
  , 'Api'
, function (
    $scope
  , User
  , $rootScope
  , $modal
  , $location
  , localStorageService
  , State
  , $timeout
  , $window
  , Api
) {

	var userStatusOnInit    = 1
	  , embedCampaignGivens = {}
	// fn declarations
	  , updateUserDataFromApi
	  , onSignIn
	  ;

	$scope.nav  = {};
	$scope.user = {};
	$scope.nav.isSignedIn = User.isSignedIn();
	$scope.state = State.state;

	$scope.nav.visible = User.isSignedIn();

	$scope.nav.isCollapsed = true;
	$scope.alerts = [];

	$scope.hey = function () {console.log("HEY");}

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
			if ( User.data.status === 0 ) {
				$location.path( '/configuracion' );
				$rootScope.$broadcast("user:statusCheck", {status: 0, changed: false});
				//$scope.addAlert( { type : 'danger'
				//                 , msg  : 'Por favor indique su correo para terminar el registro'
				//                 } );
			} else if (User.data.status === 1 && userStatusOnInit === 0) {
				userStatusOnInit = null;
				$location.path( '/configuracion' );
				$rootScope.$broadcast("user:statusCheck", {status: 1, changed: true});
			} else {
				$location.path( '/');
			}
		}, function ( reason ) {
			console.log( reason );
		} );
	}

	onSignIn = function ( givens ) {
		var path = $location.path();
		User.updateUserDataFromStorage();
		$scope.nav.visible = User.isSignedIn();
		if ( path === '/signin'
		  || path === '/signup'
		  || path === '/crear-cuenta'
		  || path === '/registrate'
		  || path !== '/'
		) {
			$scope.nav.visible = true;
		}
		$scope.user = User.data;
		$scope.nav.isSignedIn = User.isSignedIn();
	
		if ( !givens && User.data.status === 0) {
			userStatusOnInit = User.data.status;
			updateUserDataFromApi();
		}

		if ($location.path() !== '/configuracion' && User.data.status ===0 ) {
			$location.path('/configuracion');
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
		$scope.user = {};
		$scope.nav.isSignedIn = false;
	} );

	$rootScope.$on( 'user:hasDateado', function ( event, args ) {
		//updateUserDataFromApi();
	} );

	$scope.$on( '$locationChangeStart', function ( scope, next, current ){
		User.updateUserDataFromStorage();
		onSignIn({checkUserStatus: false});
	});

	//$scope.$on( '$locationChangeSuccess', function (event, args) {
	$scope.$on( '$routeChangeSuccess', function (event, args) {
		$window.scrollTo( 0, 0 );
	} );

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

	if ( User.isSignedIn()) {
		onSignIn();
	}

	// $scope.nav.datear();

}]);
