'use strict';

angular.module( 'dateaWebApp' )
.controller( 'CampaignEditCtrl'
, [ '$scope'
	, '$routeParams'
, function (
		$scope
	, $routeParams
) {
	$scope.campaignId = $routeParams.campaignId;
} ] );
