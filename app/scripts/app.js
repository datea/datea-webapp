'use strict';

var datea = angular.module( 'dateaWebApp', [ 'ngResource', 'LocalStorageModule', 'wxBirdangularModule' ] )
	.config( [ '$routeProvider', '$httpProvider',
	function ( $routeProvider, $httpProvider ) {

		$httpProvider.defaults.useXDomain = true;
		delete $httpProvider.defaults.headers.common['X-Requested-With'];

		$routeProvider
		.when( '/' , { templateUrl : 'views/main.html'
		             , controller  : 'MainCtrl'
		             } )
		.when( '/signup' , { templateUrl : 'views/signup.html'
	                     , controller  : 'SignupCtrl'
	                     } )
		.when( '/twitter-callback' , { templateUrl : 'views/twitter-callback.html'
		                             , controller  : 'TwitterCallbackCtrl'
		                             } )
		.otherwise( { redirectTo : '/' } );

	} ] );

datea.factory( 'User', [ '$http', '$resource', '$log',
	function ( $http, $resource, $log ) {
	var url
	  , defaults
	  , actions
	  ;

	url = 'http://api.datea.pe/api/v2/create_user/:Bio';

	defaults = { bio: '@Bio' }

	actions = { 'update': { method: 'PUT' } }

	return $resource( url, defaults, actions )

} ] )