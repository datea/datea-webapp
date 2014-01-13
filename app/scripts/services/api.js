'use strict';

angular.module('dateaWebApp')
.service('Api', [
  '$resource'
, 'config'
, '$q'
, 'localStorageService'
, '$http'
, function Api(
  $resource
, config
, $q
, localStorageService
, $http
) {
	var headers
	  , ls       = localStorageService
	  , dateo    = {}
	  , comment  = {}
	  , account  = {}
	  , user     = {}
	  // fn declarations
	  , reconfigUserRsrc
	  ;

	headers = ls.get('token');

	account.social          = {};
	account.social.twitter  = {};
	account.social.facebook = {};
	account.register        = {};
	account.signIn          = {};
	account.password   = {};

	reconfigUserRsrc = function () {
		user.rsrc = $resource( config.api.url + 'user/:id', {},
		{ 'get'  : { method : 'GET' }
		, 'patch': { method : 'PATCH'
		           , params : { id: '@id' }
		           , headers: headers || ls.get('token')
		           } }
		)
	}

	dateo.rsrc   = $resource( config.api.url + 'dateo/'  , {},
	{'query': { method: 'GET' } }
	);
	comment.rsrc = $resource( config.api.url + 'comment/', {},
	{ 'query': { method : 'GET' }
	, 'post' : { method  : 'POST'
	           , headers : headers || ls.get('token')
	           }
	} );
	account.social.twitter.rsrc = $resource( config.api.url + 'account/socialauth/twitter/', {},
	{ 'post': { method: 'POST' } }
	);
	account.social.facebook.rsrc = $resource( config.api.url + 'account/socialauth/facebook/', {},
	{ 'post': { method: 'POST' } }
	);
	account.register.rsrc = $resource( config.api.url + 'account/register/', {},
	{ 'post': { method : 'POST' } }
	);
	account.signIn.rsrc = $resource( config.api.url + 'account/signin/ ', {},
	{ 'post': { method : 'POST' } }
	);
	account.password.rsrc = $resource( config.api.url + 'account/reset-password/', {},
	{ 'save': { method : 'POST' } }
	)
	user.rsrc = $resource( config.api.url + 'user/:id', {},
	{ 'get'  : { method  : 'GET'
	           , params : { id: '@id' }
	           , headers : headers || ls.get('token') }
	, 'patch': { method : 'PATCH'
	           , params : { id: '@id' }
	           , headers: headers || ls.get('token')
	           } }
	)
console.log( 'api', headers );
	// User
	user.getUserByUserIdOrUsername = function ( givens ) {
		var token = ls.get('token')
		  , dfd   = $q.defer()
		  ;
		givens.id = givens && givens.username ? givens.username : givens.id;
console.log( 'user.getUserByUserIdOrUsername token', token );
		user.rsrc.get( {} , givens
		, function ( response ) {
			dfd.resolve( response );
		}
		, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	user.updateUserByUserId = function ( givens ) {
		var token = ls.get( 'token' )
		  , dfd   = $q.defer()
		  ;
		user.rsrc.patch( {}, givens
		, function ( response ) {
			dfd.resolve( response );
		}
		, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	user.getToken = function ( givens ) {
		var isFromTwitter = givens && givens.fromTwitter;
		headers = ls.get('token');
		if ( isFromTwitter ) {
			reconfigUserRsrc();
		}
	}

	// Account

	// SignIn
	account.signIn.signIn = function ( givens ) {
		var dfd= $q.defer();
		account.signIn.rsrc.post( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}


	// Register
	account.register.createUser = function ( givens ) {
		var dfd = $q.defer();
		account.register.rsrc.post( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	// Social
	account.social.signInBy3rdParty = function ( givens ) {
		var dfd   = $q.defer()
		  , party = givens.party
		  ;
		account.social[party].rsrc.post( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error )
		} );
		return dfd.promise;
	}

	// Reset Password
	account.resetPassword = function ( givens ) {
		var dfd = $q.defer();
		account.password.rsrc.save( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error )
		} );
		return dfd.promise;
	}

	// Dateo
	dateo.getDateosByUsername = function ( username ) {
		var dfd = $q.defer();
		dateo.rsrc.query( { user: username }, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	dateo.getDateoByUsernameAndDateoId = function ( givens ) {
		var dfd = $q.defer();
		dateo.rsrc.query( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	// Comment
	comment.postCommentByDateoId = function ( givens ) {
		var dfd = $q.defer()
		  , token = ls.get('token')
		  ;
		comment.rsrc.post( {}, givens
		, function ( response ) {
			dfd.resolve( response );
		}
		, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	return { dateo    : dateo
	       , comment  : comment
	       , account  : account
	       , user     : user
	       };

} ] );
