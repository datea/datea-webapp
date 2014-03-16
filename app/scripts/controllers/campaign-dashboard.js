'use strict';

angular.module( 'dateaWebApp' )
.controller( 'CampaignDashboardCtrl'
, [ '$scope'
  , 'Api'
, function (
    $scope
  , Api
) {

	var sup
	  , buildCategories
	  ;

	$scope.newCampaign = {};
	$scope.flow        = {};
	$scope.flow.categories;


buildCategories = function () {
	Api.category
	.getCategories( {} )
	.then( function ( response ) {
		$scope.flow.categories = response.objects;
		console.log( $scope.flow.categories );
	} );
}

$scope.flow.hashtagify = function ( name ) {
	var hashtag = [];
	name.split(' ').map( function (v) { hashtag.push( v.charAt(0).toUpperCase() + v.slice(1) ) } );
	return '#' + hashtag.join('');
}

$scope.flow.addTag = function () {
	$scope.newCampaign.nextTag && $scope.newCampaign.tags.push( { title: $scope.newCampaign.nextTag, tag: $scope.flow.hashtagify( $scope.newCampaign.nextTag ) } );
	$scope.newCampaign.nextTag = '';
}

$scope.flow.arrowUp = function ( idx ) {
	var temp;
	if ( idx > 0 ) {
		temp = $scope.newCampaign.tags[ idx - 1 ];
		$scope.newCampaign.tags[ idx - 1 ] = $scope.newCampaign.tags[ idx ];
		$scope.newCampaign.tags[ idx ]     = temp;
	}
}

$scope.flow.arrowDown = function ( idx ) {
	var temp;
	if ( idx < $scope.newCampaign.tags.length - 1 ) {
		temp = $scope.newCampaign.tags[ idx + 1 ];
		$scope.newCampaign.tags[ idx + 1 ] = $scope.newCampaign.tags[ idx ];
		$scope.newCampaign.tags[ idx ]     = temp;
	}
}

$scope.flow.removeTag = function ( idx ) {
	$scope.newCampaign.tags.splice( idx, 1 );
}

// Date picker
$scope.flow.today = function() {
	$scope.flow.dt = new Date();
};
// $scope.flow.today();

$scope.flow.minDate = null;

$scope.flow.dateOptions = {
	'year-format': "'yy'",
	'starting-day': 1
};

$scope.newCampaign.tags = [
{ title: 'Autos Mal Estacionados', tag: '#AutosMalEstacionados' }
]

$scope.newCampaign.save = function () {
	var campaign = {};

	campaign.name                = $scope.newCampaign.title;
	campaign.published           = 1;
	campaign.end_date            = $scope.flow.dt && $scope.flow.dt;
	campaign.short_description   = $scope.newCampaign.mission.substring(0,140);
	campaign.mission             = $scope.newCampaign.mission.substring(0,500);
	campaign.information_destiny = $scope.newCampaign.information_destiny;
	campaign.category            = $scope.flow.selectedCategory;
	campaign.main_tag            = { tag: $scope.newCampaign.main_hashtag };
	campaign.secondary_tags      = $scope.newCampaign.tags;
	campaign.center              = { type: 'Point', coordinates: [ -77.027772, -12.121937 ] };

	Api.campaign
	.postCampaign( campaign )
	.then( function ( response ) {
		console.log( response );
		console.log( 'postCampaign' );
	}, function ( reason ) {
		console.log( 'postCampaign reason: ', reason );
	} )
}

buildCategories();

// $scope.newCampaign.title = 'Pollada Bailable';
// $scope.newCampaign.mission = 'Recaudar fondos para el patio del colegio';
// $scope.newCampaign.information_destiny = 'Dirección del colegio';
// $scope.newCampaign.main_hashtag = '#polladaBailable'

} ] );
