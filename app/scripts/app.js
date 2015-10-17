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
.config(
[ '$routeProvider'
, '$httpProvider'
, '$locationProvider'
, 'localStorageServiceProvider'
, '$translateProvider'
, 'config'
, function (
  $routeProvider
, $httpProvider
, $locationProvider
, localStorageServiceProvider
, $translateProvider
, config
) {

	localStorageServiceProvider.prefix = 'datea';

	// LOAD DEFAULT LANGUAGE
	$translateProvider.useStaticFilesLoader({
	    prefix: 'locales/locale-',
	    suffix: '.json'
	});

	var lang = navigator.language || navigator.userLanguage;
	lang = lang.split('_')[0];
	lang = lang.split('-')[0];
	if (localStorage.getItem('datea.locale')) lang = localStorage.getItem('datea.locale');
	if (config.availableLocales.indexOf(lang) == -1) lang = config.defaultLocale;
	$translateProvider.preferredLanguage('es');


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

	$locationProvider.html5Mode(true);

}])
.run([ 'amMoment', 'localStorageService', '$translate', function (amMoment, localStorageService, $translate) {
	amMoment.changeLocale($translate.use());
}])
;
