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
  , 'FSAngular'
  , 'monospaced.elastic'
  , 'ngSocial'
  , 'angular-bootstrap-select'
  , 'duScroll'
  , 'angularCharts'
  , 'daPiecluster'
  , 'seo'
])
.config(
[ '$routeProvider'
, '$httpProvider'
, '$locationProvider'
, 'localStorageServiceProvider'
, function (
  $routeProvider
, $httpProvider
, $locationProvider
, localStorageServiceProvider
) {

	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
	$httpProvider.defaults.headers.patch = {
	  'Content-Type': 'application/json;charset=utf-8'
	}
	OAuth.initialize('rT1wbk04eERCkSCMnA7vvdm5UcY');
	$locationProvider.hashPrefix('!');

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
	.when( '/crear-cuenta'
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
	.when( '/dateos'
	  , { templateUrl: 'views/dateos-main.html'
	    , controller: 'DateosMainCtrl'
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
	    } )
	.when( '/:username/:campaignName'
	  , { templateUrl: 'views/campaign.html'
	    , controller: 'CampaignCtrl'
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
	.when( '/:username'
	  , { templateUrl: 'views/profile.html'
	    , controller : 'ProfileCtrl'
	    } )
	.otherwise( { redirectTo: '/' } );

	localStorageServiceProvider.prefix = 'datea';

	var $http,
	interceptor = ['$q', '$injector', function ($q, $injector) {
		var error;
		function success(response) {
			$http = $http || $injector.get('$http');
			var $timeout = $injector.get('$timeout');
			var $rootScope = $injector.get('$rootScope');
			if($http.pendingRequests.length < 1) {
				$timeout(function(){
					if($http.pendingRequests.length < 1){
						$rootScope.htmlReady();
					}
				}, 1000);
			}
			return response;
		}

		error = function error(response) {
			$http = $http || $injector.get('$http');

			return $q.reject(response);
		}

		return function (promise) {
			return promise.then(success, error);
		}
	}];

	$httpProvider.responseInterceptors.push(interceptor);

} ] );