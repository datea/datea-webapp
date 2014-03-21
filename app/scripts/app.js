'use strict';

angular.module( 'dateaWebApp'
, [ 'ngCookies'
  , 'ngResource'
  , 'ngSanitize'
  , 'ngRoute'
  , 'LocalStorageModule'
  , 'ui.bootstrap'
  , 'leaflet-directive'
  , 'geolocation'
  , 'wxGlobalErrors'
  , 'FSAngular'
  , 'monospaced.elastic'
  , 'ngSocial'
])
.config(
[ '$routeProvider'
, '$httpProvider'
, function (
  $routeProvider
, $httpProvider
) {

	// var fbAppId = '240185656082013';
	// var fbAppId = '203191529863567';

	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
	$httpProvider.defaults.headers.patch = {
	  'Content-Type': 'application/json;charset=utf-8'
	}
	// FacebookProvider.init( fbAppId );
	OAuth.initialize('rT1wbk04eERCkSCMnA7vvdm5UcY');

	$routeProvider
	.when('/'
	  , { templateUrl : 'views/main.html'
	    , controller  : 'MainCtrl'
	    } )
	.when( '/registrate'
	  , { templateUrl : 'views/signup.html'
	    , controller  : 'SignupCtrl'
	    } )
	.when( '/signup'
	  , { templateUrl : 'views/signupForm.html'
	    , controller  : 'SignupformCtrl'
	    } )
	.when( '/twitter-callback'
	  , { templateUrl : 'views/twitter-callback.html'
	    , controller  : 'TwitterCallbackCtrl'
	    } )
	.when( '/:username/dateos/:dateoId'
	  , { templateUrl: 'views/dateo-detail.html'
	    , controller : 'DateoCtrl'
	    } )
	.when( '/signin'
	  , { templateUrl: 'views/signIn.html'
	    , controller : 'SigninCtrl'
	    } )
	.when( '/updateUser'
	  , { templateUrl: 'views/updateUser.html'
	    , controller: 'UpdateuserCtrl'
	    } )
	.when( '/configuracion'
	  , { templateUrl: 'views/account.html'
	    , controller: 'AccountCtrl'
	    } )
	.when('/panel'
	  , { templateUrl: 'views/campaign-dashboard.html'
	    , controller: 'CampaignDashboardCtrl'
	    } )
	.when('/nuevaIniciativa'
	  , { templateUrl: 'views/campaign-dashboard.html'
	    , controller: 'CampaignDashboardCtrl'
	    } )
	.when( '/:username/:campaignName'
	, { templateUrl: 'views/campaign.html'
	  , controller: 'CampaignCtrl'
	  } )
	.when( '/:username'
	  , { templateUrl: 'views/profile.html'
	    , controller : 'ProfileCtrl'
	    } )
	.otherwise( { redirectTo: '/' } );

} ] );