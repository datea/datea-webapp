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
	  , tag      = {}
	  , campaign = {}
	  , activityLog = {}
	  // fn declarations
	  , reconfigUserRsrc
	  ;

	headers = ls.get('token');

	account.social          = {};
	account.social.twitter  = {};
	account.social.facebook = {};
	account.register        = {};
	account.signIn          = {};
	account.password        = {};

	tag.autocomplete = {};
	tag.trending     = {};

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
	{ 'query': { method: 'GET' }
	, 'post' : { method  : 'POST'
	           , headers : headers || ls.get('token')
	           }
	} );
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
	           , params  : { id: '@id' }
	           , headers : headers || ls.get('token') }
	, 'patch': { method : 'PATCH'
	           , params : { id: '@id' }
	           , headers: headers || ls.get('token')
	           } }
	)
	tag.autocomplete.rsrc = $resource( config.api.url + 'tag/autocomplete/', {},
	{ 'get' : { method : 'GET' } }
	)
	tag.trending.rsrc = $resource( config.api.url + 'tag/trending/', {},
	{ 'get' : { method : 'GET' } }
	)
	campaign.rsrc = $resource( config.api.url + 'campaign/', {},
	{ 'query': { method : 'GET' } }
	)
	activityLog.rsrc = $resource( config.api.url + 'activity_log/', {},
	{ 'query': { method : 'GET' } }
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
	dateo.getDateos = function ( givens ) {
		var dfd = $q.defer();
		dateo.rsrc.query( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

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

	dateo.postDateo = function ( givens ) {
		var dfd = $q.defer();
		dateo.rsrc.post( givens, function ( response ) {
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

	// Tags
	tag.getAutocompleteByKeyword = function ( givens ) {
		var dfd = $q.defer();
		tag.autocomplete.rsrc.get( givens, {}
		, function ( response ) {
			dfd.resolve( response );
		}
		, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	tag.getTrendingTags = function ( givens ) {
		var dfd = $q.defer();
		tag.trending.rsrc.get( givens, {}
		, function ( response ) {
			dfd.resolve( response );
		}
		, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	// Campaign

	campaign.getCampaigns = function ( givens ) {
		var dfd = $q.defer();
		campaign.rsrc.query( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	campaign.getCampaignsByDate = function ( givens ) {
		var dfd = $q.defer();
		campaign.rsrc.query( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	// ActivityLog

	activityLog.getActivityOfUserByUserId = function ( givens ) {
		var dfd = $q.defer();
		activityLog.rsrc.query( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	return { dateo       : dateo
	       , comment     : comment
	       , account     : account
	       , user        : user
	       , tag         : tag
	       , campaign    : campaign
	       , activityLog :activityLog
	       };

} ] );
