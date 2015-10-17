'use strict';

angular.module( 'dateaWebApp' )
.controller( 'CampaignEditCtrl'
, [ '$scope'
	, '$routeParams'
	, 'shareMetaData'
	, '$translate'
, function (
		$scope
	, $routeParams
	, shareMetaData
	, $translate
) {
	$scope.campaignId = $routeParams.campaignId;
	$scope.flow = {};
	$scope.flow.dashboardMode = 'edit';

	$translate('CAMPAIGN_FORM.PAGE_TITLE_EDIT').then(function (t) {
		shareMetaData.setData({ title : 'Datea | '+t});
	});
} ] );
