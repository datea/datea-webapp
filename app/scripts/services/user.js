'use strict';

angular.module('dateaWebApp')
.service('User', [
  'localStorageService'
, '$rootScope'
, 'Api'
, '$q'
, function User(
  localStorageService
, $rootScope
, Api
, $q
) {
	var user = {}
	  , ls   = localStorageService
	  , data = {}
	  , header
	  // fn declarations
	  , buildAuthorizationHeader
	  , getUserData
	  ;

	user.isSignedIn = function () {
		return !!ls.get( 'token' );
	}

	user.data = {};

	user.updateUserDataFromStorage = function () {
		console.log( 'user.updateUserDataFromStorage()', user.isSignedIn(), !Object.keys( user.data ).length );
		// if ( user.isSignedIn() && !Object.keys( user.data ).length ) {
	  if ( user.isSignedIn() ) {
			user.data = ls.get('user');
		}
		Api.user.getToken();
	}

	user.updateTokenOnTwitterSignup = function () {
		Api.user.getToken( { fromTwitter: true } );
	}

	buildAuthorizationHeader = function ( givens ) {
		var token;
		header = givens && { 'Authorization' : 'Apikey ' + givens.username + ':' + givens.token }
		return header;
	}

	getUserData = function ( givens ) {
		var username = givens && givens.username
		  , id       = givens && givens.id
		  , dfd      = $q.defer()
		  ;
console.log( 'getUserData givens', givens );
		Api.user.getToken();
		if ( user.isSignedIn() && username ) {
			Api.user.getUserByUserIdOrUsername( { username: username } )
			.then( function ( response ) {
				dfd.resolve( response );
			} );
		} else if ( user.isSignedIn() && id ) {
			Api.user.getUserByUserIdOrUsername( { id: id } )
			.then( function ( response ) {
				dfd.resolve( response );
			} );
		} else if ( !user.isSignedIn() && username ) {
			Api.user.getUserByUserIdOrUsername( { username: username } )
			.then( function ( response ) {
				dfd.resolve( response );
			} );
		} else {
			dfd.reject( 'not username or id' );
		}

		return dfd.promise;
	}

	user.getData = getUserData;

	user.updateUser = function ( givens ) {
		var dfd = $q.defer();
		Api.user.updateUserByUserId( givens )
		.then( function ( response ) {
			var updatedData
			  , currentData = ls.get('user')
			  ;
			console.log( response );
			dfd.resolve( response );
		}, function ( error ) {
			console.log( 'error', error );
			dfd.reject( error );
		} )
		return dfd.promise
	}

	user.signInBy3rdParty = function ( givens ) {
		var dfd = $q.defer();
		Api.account.social.signInBy3rdParty( givens )
		.then( function ( response ) {
			var headerGivens = {};
			headerGivens.username = response.user.username;
			headerGivens.token    = response.token;

			header = buildAuthorizationHeader( headerGivens );
			ls.set( 'token', header );
			user.isSignedIn();
console.log( 'user.signInBy3rdParty', 'response.user', response.user );
			data = response.user;
			user.data = data;
			ls.set( 'user', data );
			$rootScope.$broadcast( 'user:signedIn' );
			dfd.resolve( user.data );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	user.signIn = function ( givens ) {
		var username = givens.username
		  , dfd      = $q.defer()
		  ;

		Api.account.signIn.signIn( givens )
		.then( function ( response ) {
			var headerGivens = {};
			headerGivens.username = username;
			headerGivens.token    = response.token;

			header = buildAuthorizationHeader( headerGivens );
			ls.set( 'token', header );
			user.isSignedIn();

			data = response.user;
			user.data = data;
			ls.set( 'user', data );
			$rootScope.$broadcast( 'user:signedIn' );
			dfd.resolve( user.data );

			// getUserData( headerGivens ).then( function ( response ) {
			// 	data = response.objects[0];
			// 	user.data = data;
			// 	ls.set( 'user', data );
			// 	$rootScope.$broadcast( 'user:signedIn' );
			// 	dfd.resolve( response );
			// } );

		} );

		return dfd.promise;
	}

	user.signOut = function () {
		user.data  = {};
		ls.remove( 'token' );
		ls.remove( 'user' );
		user.isSignedIn();
		$rootScope.$broadcast( 'user:signedOut' );
	}

	user.resetPassword = function ( givens ) {
		var dfd = $q.defer();
		Api.account.resetPassword( givens )
		.then( function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	user.getAuthorizationHeader = function () {
		return header || ls.get('token');
	}

	user.updateUserDataFromStorage();

	return user;
} ] );
