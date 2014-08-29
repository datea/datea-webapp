'use strict';

angular.module( 'dateaWebApp' )
.controller( 'LandingCtrl'
, [ '$scope'
  , 'Api'
  , 'config'
  , 'shareMetaData'
, function (
    $scope
  , Api
  , config
  , shareMetaData
) {

	$scope.landing = {};
	$scope.dateFormat = config.defaultDateFormat;

	shareMetaData.resetToDefault();

	Api.stats.getStats()
	.then( function ( response ) {
		$scope.landing.dateo_count = response.dateo_count;
		$scope.landing.user_count  = response.user_count;
	}, function ( error ) {
		console.log( error );
	} );

	Api.tag
	.getTrendingTags( { limit: 5, days: 40 } )
	.then( function ( response ) {
		$scope.landing.trendingTags = response.objects;
	}, function ( reason ) {
		console.log( reason );
	} );

	Api.dateo
	.getDateos( { limit: 1 } )
	.then( function ( response ) {
		$scope.landing.outstandingDateo = response.objects[0];
	}, function ( reason ) {
		console.log( reason );
	} );

	Api.campaign
	.getCampaigns( { limit: 4, featured: 1, order_by: '-created' } )
	.then( function ( response ) {
		console.log( 'campaign', response.objects );
		$scope.landing.outstandingCampaigns = response.objects;
	}, function ( reason ) {
		console.log( reason );
	} );
} ] );
