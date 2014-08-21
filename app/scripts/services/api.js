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
	  , ls          = localStorageService
	  , dateo       = {}
	  , dateoStatus = {}
	  , redateo     = {}
	  , comment     = {}
	  , account     = {}
	  , user        = {}
	  , tag         = {}
	  , campaign    = {}
	  , activityLog = {}
	  , category    = {}
	  , follow      = {}
	  , userFollow  = {}
	  , vote        = {}
	  , flag        = {}
	  , stats       = {}
	  , ipLocation  = {}
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
	account.passwordChange  = {};
	account.usernameExists  = {};
	account.emailExists     = {};

	tag.autocomplete = {};
	tag.trending     = {};

	reconfigUserRsrc = function () {
		user.rsrc = $resource( config.api.url + 'user/:id', {},
		{ 'get'  : { method : 'GET'
		           , headers: headers || ls.get('token') }
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
	dateoStatus.rsrc   = $resource( config.api.url + 'dateo_status/'  , {},
	{ 'query': { method  : 'GET' }
	, 'post' : { method  : 'POST'
	           , headers : headers || ls.get('token') }
	, 'patch': { method  : 'PATCH'
	           , params  : { id: '@id' }
	           , headers : headers || ls.get('token') }
	, 'put'  : { method  : 'PUT'
	           , params  : { id: '@id' }
	           , headers : headers || ls.get('token') }
	, 'delete' : { method : 'DELETE'
	             , headers : headers || ls.get('token') }
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
	);
	account.passwordChange.rsrc = $resource( config.api.url + 'account/reset-password-confirm/', {},
	{ 'save': { method : 'POST' } }
	);
	account.usernameExists.rsrc = $resource( config.api.url + 'account/username-exists', {},
	{ 'query': { method : 'GET'} }
	)
	account.emailExists.rsrc = $resource( config.api.url + 'account/email-exists', {},
	{ 'query': { method : 'GET'} }
	)
	user.rsrc = $resource( config.api.url + 'user/:id', {},
	{ 'get'  : { method  : 'GET'
	           , params  : { id: '@id' }
	           , headers : headers || ls.get('token') }
	// , 'query': { method : 'GET'
	//            , params : {} }
	, 'patch': { method : 'PATCH'
	           , params : { id: '@id' }
	           , headers: headers || ls.get('token')
	           } }
	);
	userFollow.rsrc = $resource( config.api.url + 'user/', {},
	{ 'query' : { method : 'GET' } }
	);
	tag.rsrc = $resource( config.api.url + 'tag/', {},
	{ 'get' : { method : 'GET' } }
	);
	tag.autocomplete.rsrc = $resource( config.api.url + 'tag/autocomplete/', {},
	{ 'get' : { method : 'GET' } }
	);
	tag.trending.rsrc = $resource( config.api.url + 'tag/trending/', {},
	{ 'get' : { method : 'GET' } }
	);
	campaign.rsrc = $resource( config.api.url + 'campaign/', {},
	{ 'query': { method : 'GET' }
	, 'post' : { method : 'POST'
	           , headers : headers || ls.get('token') }
	, 'patch': { method : 'PATCH'
						 , headers : headers || ls.get('token') }
	} );
	activityLog.rsrc = $resource( config.api.url + 'activity_log/', {},
	{ 'query': { method : 'GET' } }
	)
	category.rsrc = $resource( config.api.url + 'category/', {},
	{ 'query': { method : 'GET' } }
	)
	follow.rsrc = $resource( config.api.url + 'follow/', {},
	{ 'query'  : { method : 'GET' }
	, 'post'   : { method : 'POST'
	             , headers : headers || ls.get('token') }
	, 'delete' : { method : 'DELETE'
	             , headers : headers || ls.get('token') }
	} );
	vote.rsrc = $resource( config.api.url + 'vote/', {},
	{ 'query' : { method : 'GET' }
	, 'post'  : { method : 'POST'
	            , headers : headers || ls.get('token') }
	, 'delete' : { method : 'DELETE'
	             , headers : headers || ls.get('token') }
	} );
	flag.rsrc = $resource( config.api.url + 'flag/', {},
	{ 'post' : { method : 'POST'
	           , headers : headers || ls.get('token') }
	} );
	stats.rsrc = $resource( config.api.url + 'dateo/stats/', {},
	{ 'query' : { method : 'GET' } }
	)
	redateo.rsrc   = $resource( config.api.url + 'redateo/'  , {},
	{ 'query': { method  : 'GET' }
	, 'post' : { method  : 'POST'
	           , headers : headers || ls.get('token') }
	, 'delete' : { method : 'DELETE'
	             , headers : headers || ls.get('token') }
	} );
	ipLocation.rsrc = $resource( config.api.url + 'ip_location', {},
	{ 'query' : { method : 'GET'} }
	);

  //console.log( 'api', headers );
	// User
	user.getUserByUserIdOrUsername = function ( givens ) {
		var token = ls.get('token')
		  , dfd   = $q.defer()
		  ;
		givens.id = givens && givens.username ? givens.username : givens.id;
		reconfigUserRsrc();
		//console.log( 'user.getUserByUserIdOrUsername token', token );
		user.rsrc.get( givens
		, function ( response ) {
			dfd.resolve( response );
		}
		, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	user.getUsers = function ( givens ) {
		var dfd = $q.defer();
		userFollow.rsrc.query( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
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

	account.register.usernameExists = function ( givens ) {
		var dfd = $q.defer();
		account.usernameExists.rsrc.query( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	account.register.emailExists = function ( givens ) {
		var dfd = $q.defer();
		account.emailExists.rsrc.query( givens, function ( response ) {
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

	// Change Password
	account.changePassword = function (givens) {
		var dfd = $q.defer();
		account.passwordChange.rsrc.save( givens, function ( response ) {
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

	// DateoStatus
	dateoStatus.postList = function(givens) {
		var dfd = $q.defer();
		dateoStatus.rsrc.post(givens, function(response) {
			dfd.resolve(response);
		}, function (error) {
			dfd.reject(error);
		} );
		return dfd.promise;
	}
	dateoStatus.putList = function(givens) {
		var dfd = $q.defer();
		dateoStatus.rsrc.put(givens, function(response) {
			dfd.resolve(response);
		}, function (error) {
			dfd.reject(error);
		} );
		return dfd.promise;
	}
	dateoStatus.patchList = function(givens) {
		var dfd = $q.defer();
		dateoStatus.rsrc.patch(givens, function(response) {
			dfd.resolve(response);
		}, function (error) {
			dfd.reject(error);
		} );
		return dfd.promise;
	}
	dateoStatus.getList = function(givens) {
		var dfd = $q.defer();
		dateoStatus.rsrc.query(givens, function(response) {
			dfd.resolve(response);
		}, function (error) {
			dfd.reject(error);
		} );
		return dfd.promise;
	}
	dateoStatus.deleteList = function (givens) {
		var dfd = $q.defer();
		dateoStatus.rsrc.delete(givens, function(response) {
			dfd.resolve(response);
		}, function (error) {
			dfd.reject(error);
		} );
		return dfd.promise;
	}

	// redateo
	redateo.post = function(givens) {
		var dfd = $q.defer();
		redateo.rsrc.post(givens, function(response) {
			dfd.resolve(response);
		}, function (error) {
			dfd.reject(error);
		} );
		return dfd.promise;
	}
	redateo.getList = function(givens) {
		var dfd = $q.defer();
		redateo.rsrc.query(givens, function(response) {
			dfd.resolve(response);
		}, function (error) {
			dfd.reject(error);
		} );
		return dfd.promise;
	}
	redateo.deleteList = function (givens) {
		var dfd = $q.defer();
		redateo.rsrc.delete(givens, function(response) {
			dfd.resolve(response);
		}, function (error) {
			dfd.reject(error);
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
	tag.getTags = function ( givens ) {
		var dfd = $q.defer();
		tag.rsrc.get( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

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

	// campaign.getCampaignsByDate = function ( givens ) {
	// 	var dfd = $q.defer();
	// 	campaign.rsrc.query( givens, function ( response ) {
	// 		dfd.resolve( response );
	// 	}, function ( error ) {
	// 		dfd.reject( error );
	// 	} );
	// 	return dfd.promise;
	// }

	campaign.postCampaign = function ( givens ) {
		var dfd = $q.defer();
		campaign.rsrc.post( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	campaign.patchCampaign = function ( givens ) {
		var dfd = $q.defer();
		campaign.rsrc.patch( givens, function ( response ) {
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

	// Category

	category.getCategories = function ( givens ) {
		var dfd = $q.defer();
		category.rsrc.query( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	// Follow

	follow.getFollows = function ( givens ) {
		var dfd = $q.defer();
		follow.rsrc.query( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	follow.doFollow = function ( givens ) {
		var dfd = $q.defer();
		follow.rsrc.post( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	follow.doUnfollow = function ( givens ) {
		var dfd = $q.defer();
		follow.rsrc.delete( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	// Vote

	vote.getVotes = function ( givens ) {
		var dfd = $q.defer();
		vote.rsrc.query( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	vote.doVote = function ( givens ) {
		var dfd   = $q.defer()
		  , token = ls.get('token')
		  ;
		vote.rsrc.post( {}, givens
		, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	vote.deleteVote = function ( givens ) {
		var dfd   = $q.defer()
		  , token = ls.get('token')
		  ;
		vote.rsrc.delete( {}, givens
		, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	// Flag

	flag.doFlag = function ( givens ) {
		var dfd = $q.defer();
		flag.rsrc.post( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	// Stats

	stats.getStats = function ( givens ) {
		var dfd = $q.defer();
		stats.rsrc.query( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	// Ip Location

	ipLocation.getLocationByIP = function ( givens ) {
		var dfd = $q.defer();
		ipLocation.rsrc.query( givens, function ( response ) {
			dfd.resolve( response );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	return { dateo       : dateo
				 , dateoStatus : dateoStatus
				 , redateo     : redateo
	       , comment     : comment
	       , account     : account
	       , user        : user
	       , tag         : tag
	       , campaign    : campaign
	       , activityLog : activityLog
	       , category    : category
	       , follow      : follow
	       , vote        : vote
	       , flag        : flag
	       , stats       : stats
	       , ipLocation  : ipLocation
	       };

} ] );
