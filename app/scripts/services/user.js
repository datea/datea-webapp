'use strict';

angular.module('dateaWebApp')
.service('User', [
  'localStorageService'
, '$rootScope'
, 'Api'
, '$q'
, '$timeout'
, '$location'
, function User(
  localStorageService
, $rootScope
, Api
, $q
, $timeout
, $location
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

	user.data  = {};
	user.isNew = false;

	user.updateUserDataFromStorage = function () {
		//console.log( 'user.updateUserDataFromStorage()', user.isSignedIn(), !Object.keys( user.data ).length );
		if ( user.isSignedIn() ) {
			angular.extend( user.data, ls.get('user') );
			// user.data = ls.get('user');
		}
		Api.user.getToken( { fromTwitter: true } );
		$rootScope.$broadcast( 'user:updated' );
	}

	user.writeDataToStorage = function () {
		ls.set('user', user.data);
	}

	user.updateTokenOnTwitterSignup = function () {
		Api.user.getToken( { fromTwitter: true } );
	}

	buildAuthorizationHeader = function ( givens ) {
		var token;
		header = givens && { 'Authorization' : 'Apikey ' + givens.username + ':' + givens.token }
		return header;
	}

	user.updateHeader = function (username, token) {
  	var header = buildAuthorizationHeader({username: username, token: token});
  	ls.set( 'token', header );
		Api.resetRscs();
	}

	getUserData = function ( givens ) {
		var username = givens && givens.username
		  , id       = givens && givens.id
		  , dfd      = $q.defer()
		  ;

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

	// user.updateUserDataFromApiDeep = function () {
	// 	var ls = localStorageService
	// 	  , updatedData
	// 	  , currentData = ls.get('user')
	// 	  ;

	// 	Api.user.getToken( { fromTwitter: true } );
	// 	Api.user.getUserByUserIdOrUsername( { username: currentData.username } )
	// 	.then( function ( response ) {
	// 		updatedData = response;
	// 		angular.extend( currentData, updatedData );
	// 		ls.set( 'user', currentData );
	// 		user.updateUserDataFromStorage();

	// 	}, function ( reason ) {
	// 		console.log( reason );
	// 	} );
	// }

	user.updateUserDataFromApi = function ( callback ) {
		var ls = localStorageService
		  , updatedData
		  , currentData = ls.get('user')
		  ;

		getUserData( { username: currentData.username } )
		.then( function ( response ) {
			updatedData = response;
			//console.log( '!! updateUserDataFromApi !!', response );
			angular.extend( currentData, updatedData );
			ls.set( 'user', currentData );
			user.updateUserDataFromStorage();
			if ( user.data.status === 0 ) {
				$location.path( '/configuracion' );
				//$scope.addAlert( { type : 'danger'
				//                 , msg  : 'Por favor indique su correo para terminar el registro'
				//                 } );
				return;
			}

			callback && callback();

		}, function ( reason ) {
			console.log( reason );
		} );
	}

	user.updateUser = function ( givens ) {
		var dfd = $q.defer();
		Api.user.updateUserByUserId( givens )
		.then( function ( response ) {
			var updatedData = response
			  , currentData = ls.get('user')
			  ;
			angular.extend( currentData, updatedData );
			ls.set( 'user', currentData );
			user.updateUserDataFromStorage();
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
			Api.resetRscs();
			user.isSignedIn();
			data = response.user;
			user.data = data;
			user.data.authProvider = givens.party;
			user.isNew = response.is_new;
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

			user.isNew = response.is_new;

			header = buildAuthorizationHeader( headerGivens );
			Api.resetRscs();
			ls.set( 'token', header );
			user.isSignedIn();

			data = response.user;
			user.data = data;
			user.data.authProvider = 'datea';
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

		}, function (error) {
			dfd.reject(error);
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
