'use strict';

var datea = angular.module( 'dateaWebApp', [ 'ngResource' ] )
	.config( [ '$routeProvider', '$httpProvider',
	function ( $routeProvider, $httpProvider ) {

		$httpProvider.defaults.useXDomain = true;
		delete $httpProvider.defaults.headers.common['X-Requested-With'];

		$routeProvider
		.when( '/' , { templateUrl : 'views/main.html'
		             , controller  : 'MainCtrl'
		             } )
		.otherwise( { redirectTo : '/' } );

	} ] );


// Using a validation directive

// datea.directive( 'formText', function () {
// 	var ret
// 	  , link
// 	  ;

// 	link = function ( scope, elm, attrs, ctrl ) {
// 		ctrl.$parsers.unshift( function ( val ) {
// 			scope.formText = /[A-z]/.test( val ) ? 'valid' : undefined;

// 			if ( scope.formText ) {
// 				ctrl.$setValidity( 'text', true );
// 				return val;
// 			} else {
// 				ctrl.$setValidity( 'text', false );
// 				return undefined;
// 			}

// 		} );
// 	}

// 	ret = { require: 'ngModel'
// 	      , link   : link }

// 	return ret;

// } );

datea.factory( 'User', [ '$http', '$resource', '$log',
	function ( $http, $resource, $log ) {
	var url
	  , defaults
	  , actions
	  ;

	url = 'http://192.168.1.37:8000/api/v2/create_user/:Bio';

	defaults = { bio: '@Bio' }

	actions = { 'update': { method: 'PUT' } }

	return $resource( url, defaults, actions )

} ] )