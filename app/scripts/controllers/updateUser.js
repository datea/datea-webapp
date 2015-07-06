'use strict';

angular.module('dateaWebApp')
.controller('UpdateuserCtrl'
, [ '$scope'
  , 'User'
  , '$location'
  , 'localStorageService'
  , '$rootScope'
, function (
    $scope
  , User
  , $location
  , localStorageService
  , $rootScope
) {
	var ls = localStorageService
	  , updatedData
	  , currentData = ls.get('user')
	  ;

	User.getData( { username: currentData.username} )
	.then( function ( response ) {
		updatedData = response;
		angular.extend(currentData, updatedData);
		ls.set( 'user', currentData );
		$rootScope.$broadcast( 'user:signedUp' );
		User.updateUserDataFromStorage();
		$location.path( '/signin' );
	}, function ( reason ) {
		console.log( reason );
	} );
} ] );
