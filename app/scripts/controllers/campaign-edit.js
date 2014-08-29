'use strict';

angular.module( 'dateaWebApp' )
.controller( 'CampaignEditCtrl'
, [ '$scope'
	, '$routeParams'
	, 'shareMetaData'
, function (
		$scope
	, $routeParams
	, shareMetaData
) {
	$scope.campaignId = $routeParams.campaignId;
	$scope.flow = {};
	$scope.flow.dashboardMode = 'edit';

	shareMetaData.setData({ title : 'Datea | editar iniciativa'});
} ] );
