'use strict';

angular.module( 'dateaWebApp'
, [ 'ngCookies'
  , 'ngResource'
  , 'ngSanitize'
  , 'ngRoute'
  , 'LocalStorageModule'
  , 'leaflet-directive'
  , 'geolocation'
  , 'FSAngular'
  , 'monospaced.elastic'
  , 'ngSocial'
  , 'angular-bootstrap-select'
  , 'ui.bootstrap'
  , 'ui.bootstrap.dropdown'
  , 'duScroll'
  , 'angularCharts'
  , 'daPiecluster'
  , 'angulartics'
  , 'angulartics.google.analytics'
  , 'monospaced.mousewheel'
  , 'angularMoment'
  , 'pascalprecht.translate'
])
.run([ 'amMoment', function (amMoment) {
	amMoment.changeLocale('es');
}])
.config(
[ '$routeProvider'
, '$httpProvider'
, '$locationProvider'
, 'localStorageServiceProvider'
, '$translateProvider'
, function (
  $routeProvider
, $httpProvider
, $locationProvider
, localStorageServiceProvider
, $translateProvider
) {

	$translateProvider.useStaticFilesLoader({
	    prefix: 'locales/locale-',
	    suffix: '.json'
	});
	$translateProvider.preferredLanguage('es');

	console.log('navigator', navigator);

	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
	$httpProvider.defaults.headers.patch = {
	  'Content-Type': 'application/json;charset=utf-8'
	}
	OAuth.initialize('du8nXdQmkjgR3nrfsjHxO07INhk');
	$locationProvider.hashPrefix('!');

	$routeProvider
	.when('/'
	  , { templateUrl : 'views/main.html'
	    , controller  : 'MainCtrl'
	    } )
	.when('/home2'
	  , { templateUrl : 'views/homeSignedIn-bckp.html'
	    , controller  : 'MainBckpCtrl'
	    } )
	.when('/acerca'
	  , { templateUrl : 'views/about.html'
	    } )
	.when( '/registrate'
	  , { templateUrl : 'views/signup.html'
	    , controller  : 'SignupCtrl'
	    } )
	.when( '/signup'
	  , { templateUrl : 'views/signupForm.html'
	    , controller  : 'SignupformCtrl'
	    } )
	.when( '/crear-cuenta'
	  , { templateUrl : 'views/signupForm.html'
	    , controller  : 'SignupformCtrl'
	    } )
	.when( '/twitter-callback'
	  , { templateUrl : 'views/twitter-callback.html'
	    , controller  : 'TwitterCallbackCtrl'
	    } )
	.when( '/signin'
	  , { templateUrl: 'views/signIn.html'
	    , controller : 'SigninCtrl'
	    } )
	.when( '/change-password/:uid/:token'
		, { templateUrl: 'views/change-password.html'
		  , controller : 'ChangePasswordCtrl'
		} )
	.when( '/updateUser'
	  , { templateUrl: 'views/updateUser.html'
	    , controller: 'UpdateuserCtrl'
	    } )
	.when( '/configuracion'
	  , { templateUrl: 'views/account.html'
	    , controller: 'AccountCtrl'
	    , reloadOnSearch: false
	    } )
	.when( '/panel'
	  , { templateUrl: 'views/campaign-dashboard.html'
	    , controller: 'CampaignDashboardCtrl'
	    } )
	.when( '/iniciativas'
	  , { templateUrl: 'views/campaign-list.html'
	    , controller: 'CampaignListCtrl'
	    } )
	.when( '/crear-iniciativa'
	  , { templateUrl: 'views/campaign-create.html'
	    //, controller: 'CampaignCreateCtrl'
	    } )
	.when( '/tag/:tagName'
	  , { templateUrl: 'views/tag.html'
	    , controller: 'TagCtrl'
	    , reloadOnSearch: false
	    } )
	.when( '/iniciativas/:campaignId/edit'
		, { templateUrl: 'views/campaign-dashboard.html'
			,	controller:  'CampaignEditCtrl'
		} )
	.when( '/iniciativas/:campaignId/admin'
		, { templateUrl: 'views/campaign-dashboard.html'
			,	controller:  'DateosAdminCtrl'
			, reloadOnSearch: false
		} )
	.when( '/404'
		, { templateUrl: 'views/404.html'} 
	)
	.when( '/buscar'
		, { templateUrl: 'views/dateo-search.html'
			, controller : 'DateoSearchCtrl' 
			, reloadOnSearch: false
	} )
	.when( '/buscar/:search'
		, { templateUrl: 'views/dateo-search.html'
			, controller : 'DateoSearchCtrl' 
			, reloadOnSearch: false
	} )
		/* COMPATIBILITY WITH OLD URLS */
	.when( '/dateos/:dateoId'
		, { templateUrl: 'views/redirect.html'
			, controller : 'RedirectToDateoCtrl' 
		} )
	.when( '/mapeo/:campaignId/dateos/:dateoId'
		, { templateUrl: 'views/redirect.html'
			, controller : 'RedirectToDateoCtrl' 
		} )
	.when( '/mapeo/:campaignId/dateos'
		, { templateUrl: 'views/redirect.html'
			, controller : 'RedirectToCampaignCtrl' 
		} )
	.when( '/mapeo/:campaignId'
		, { templateUrl: 'views/redirect.html'
			, controller : 'RedirectToCampaignCtrl' 
		} )

	.when('/acerca/terminos'
		, {templateUrl: 'views/terminos.html'}
	)
  .when('/acerca/privacidad'
  	, {templateUrl: 'views/privacidad.html'}
	)
	.when( '/:username/:campaignName'
	  , { templateUrl: 'views/campaign.html'
	    , controller: 'CampaignCtrl'
	    , reloadOnSearch: false
	    } )
	.when( '/:username/dateos/:dateoId'
	  , { templateUrl: 'views/dateo-detail.html'
	    , controller : 'DateoCtrl'
	    } )
	.when( '/:username'
	  , { templateUrl: 'views/profile.html'
	    , controller : 'ProfileCtrl'
	    } )
	.otherwise( { redirectTo: '/404' } );

	localStorageServiceProvider.prefix = 'datea';

	$locationProvider.html5Mode(true);

} ] );
