'use strict';

angular.module( 'dateaWebApp' )
.controller( 'MainCtrl'
, [ '$scope'
  , 'User'
  , '$http'
  , '$location'
  , '$rootScope'
, function (
    $scope
  , User
  , $http
  , $location
  , $rootScope
) {
	var data
	  , dateo = {}
	  , headers
	  ;

	headers = { 'Authorization'  : 'Apikey root:106b7be6c0028671fa6e2d57209f53ad42e14a20'
	          }

	dateo.address   = 'Calle x 546';
	dateo.category  = '/api/v2/category/1/';
	dateo.content   = 'this is a test take six';
	dateo.position  = { coordinates : [ -77.027772, -12.121937 ]
	                  , type        : 'Point'
	                  }
	dateo.tags      = [ { tag : 'testTag' }
	                  , { tag          : 'Aaaa'
	                    , title        : 'aaaa'
	                    , dateo_count  : 0
	                    , description  : 'aaaa'
	                    , follow_count : 0
	                    , id           : 3
	                    , resource_uri : '/api/v2/tag/3/'
	                    }
	                  ]
	dateo.date      = new Date();
	dateo.user      = 1;


	$scope.flow = {};

	$scope.flow.visible = !User.isSignedIn;

	$scope.flow.apiCall = function () {
		var url = 'http://api.datea.pe/api/v2/dateo/?format=json';

		$http( { method  : 'post'
		       , url     : url
		       , headers : headers
		       , data    : dateo
		       } )
		.then( function ( response ) {
			console.log( 'Calling api.datea.pe: ', response );
		} )

	}

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
