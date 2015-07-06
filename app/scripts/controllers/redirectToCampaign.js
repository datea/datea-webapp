'use strict';

angular.module('dateaWebApp')
.controller('RedirectToCampaignCtrl'
, [ '$scope'
	, '$routeParams'
	, 'Api'
	, 'config'
	, '$location'
, function (
		$scope
	, $routeParams
	, Api
	, config
	, $location
 ) {

	// get username
	if ($routeParams.campaignId) {
		Api.campaign
		.getCampaigns({id: $routeParams.campaignId})
		.then(function (response) {
			var campaign;
			if (response.objects.length) {
				campaign = response.objects[0];
				$location.path('/'+campaign.user.username+'/'+campaign.slug).replace();
			}else {
				$location.path('/404').replace();
			}
		}, function (reason) {
			if ( reason.status === 404 ) {
				$location.path('/404').replace();
			}
		});
	}
} ] );
