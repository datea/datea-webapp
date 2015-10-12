// Big warning, use the codebird file from this repo since I added a getToken function to it
// pull request pending
( function () {
	var wxBirdangular = angular.module( 'wxBirdangularModule', [ ] );

	wxBirdangular.constant('keys', { key    : 'UR_KEY'
	                               , secret : 'UR_SECRET'
	                               } );

	wxBirdangular.value( 'cbUrl', "UR_CALLBACK_URL" );

	wxBirdangular.service( 'wxBirdangularService',
	[ 'cbUrl', '$q', '$window', '$rootScope', 'keys',
	function ( cbUrl, $q, $window, $rootScope, keys ) {
		var cb
		  , authorize
		  , requestToken
		  , accessToken
		  , verifyCredentials
		  , user
		  , get
		  , setToken
		  ;

		cb        = new Codebird;
		user      = {};
		user.keys = {};

		cb.setConsumerKey( keys.key, keys.secret );

		authorize = function () {
			cb.__call( "oauth_authorize", {},
			function ( auth_url ) {
				$window.codebird_auth = $window.open( auth_url );
			} );
		}

		requestToken = function () {
			cb.__call( "oauth_requestToken"
			, { oauth_callback : cbUrl }
			// TODO: handle oob
			// , { oauth_callback : "oob" }
			, function ( response ) {
				cb.setToken( response.oauth_token, response.oauth_token_secret );
				$window.oauth_token        = response.oauth_token;
				$window.oauth_token_secret = response.oauth_token_secret;
				authorize();
				}
			)
		}

		accessToken = function ( verifyCode ) {
			var dfd = $q.defer();
			cb.__call( "oauth_accessToken"
			, { oauth_verifier : verifyCode }
			, function ( response ) {
					cb.setToken( response.oauth_token, response.oauth_token_secret );
					$rootScope.$apply( function () {
						user.keys = { token  : response.oauth_token
						            , secret : response.oauth_token_secret };
						user.screen_name = response.screen_name;
						user.user_id     = response.user_id;
						dfd.resolve( response );
					} );

			} );
			return dfd.promise;
		}

		verifyCredentials = function ( keys ) {
			var dfd = $q.defer()
			  , hasTokens
			  ;

			hasTokens = cb.getToken();

			if ( hasTokens ) {
				cb.__call( "account_verifyCredentials"
				, {}
				, function ( response ) {
						$rootScope.$apply( function () {
							$.extend( user, response );
							dfd.resolve( response );
						} );
				} );
			} else {
				return dfd.reject( 'no tokens' );
			}
			return dfd.promise;
		}

		// This should be name "call" or sth like that
		// but maybe we need for another wrapper for a set kind of functionality
		get = function ( givens ) {
			var dfd = $q.defer()
			  , hasTokens
			  , keys
			  , args
			  , fn
			  ;

			keys      = givens && givens.keys;
			fn        = givens && givens.fn;
			args      = givens && givens.args || {};
			hasTokens = cb.getToken();

			if ( hasTokens ) {
				cb.__call( fn
				, args
				, function ( response ) {
					$rootScope.$apply( function () {
						dfd.resolve( response );
					} );
				} )
			} else {
				dfd.reject( 'no tokens' );
			}

			return dfd.promise;
		}

		setToken = function ( givens ) {
			var token  = givens && givens.token
			  , secret = givens && givens.secret
			  ;
			cb.setToken( token, secret );
		}

		return { authorize         : authorize
		       , requestToken      : requestToken
		       , accessToken       : accessToken
		       , verifyCredentials : verifyCredentials
		       , user              : user
		       , get               : get
		       , setToken          : setToken
		       };

	} ] );

} ).call( this );