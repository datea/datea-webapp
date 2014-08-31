'use strict';

/**
 * @ngdoc function
 * @name dateaWebApp.controller:EmbedbuilderCtrl
 * @description
 * # EmbedbuilderCtrl
 * Controller of the dateaWebApp
 */
angular.module('dateaWebApp')
.controller('EmbedbuilderCtrl',
[ '$scope'
, '$modalInstance'
, 'embedBuilderGivens'
, '$interpolate'
, '$timeout'
, 'config'
, function (
  $scope
, $modalInstance
, embedBuilderGivens
, $interpolate
, $timeout
, config
) {

	$scope.embed = {};
	$scope.embed.author  = embedBuilderGivens.author;
	$scope.embed.mainTag = embedBuilderGivens.mainTag;

	$scope.embed.template = $interpolate(config.embed.defaultEmbedIframe)($scope);

	$timeout( function () {
		$('textarea').select();
	}, 100 );

} ] );
