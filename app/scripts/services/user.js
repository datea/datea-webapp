'use strict';

angular.module('dateaWebApp')
.service('User', [
	'localStorageService'
, '$rootScope'
, function User(
	localStorageService
, $rootScope
) {
	var user = {}
	  , ls   = localStorageService
	  ;

	user.isSignedIn = ls.get( 'signIn' );

	user.signIn = function () {
		ls.set( 'signIn', 'someHash' );
		user.isSignedIn = ls.get( 'signIn' );
		$rootScope.$broadcast( 'user:signedIn' );
	}

	user.signOut = function () {
		ls.remove( 'signIn' );
		user.isSignedIn = ls.get( 'signIn' );
		$rootScope.$broadcast( 'user:signedOut' );
	}

	return user;
} ] );
