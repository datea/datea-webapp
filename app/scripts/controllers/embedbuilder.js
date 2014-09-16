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

	$scope.flow = {};
	$scope.embed = {};
	$scope.embed.author  = embedBuilderGivens.author;
	$scope.embed.mainTag = embedBuilderGivens.mainTag;
	$scope.embed.path    = embedBuilderGivens.path;
	angular.extend($scope.embed, config.embed);
	$scope.embed.width = $scope.embed.widthResult = config.embed.defaultWidth;
	$scope.embed.height = config.embed.defaultHeight;
	$scope.embed.widthResult = config.embed.width;
	console.log($scope.embed);

	// setting the range inputs again!
	$timeout(function () {
		$scope.$apply(function () {
			$scope.embed.width = String(config.embed.defaultWidth);
			$scope.embed.height = String(config.embed.defaultHeight);
		});
	}, 100);

	$scope.flow.changeWidthResult = function () {
		var w;
		if (String($scope.embed.widthResult).charAt(-1) === '%') {
			if (String($scope.embed.widthResult).replace('%', '') !== '100') {
				$scope.embed.widthResult = '100%';
				$scope.embed.width = config.embed.maxWidth;
			}
		}
		if (parseInt($scope.embed.widthResult)) {
			w = parseInt($scope.embed.widthResult);
			if (w < config.embed.minWidth) w = config.embed.minWidth;
			if (w > config.embed.maxWidth) w = config.embed.maxWidth;
			
			if (w === config.embed.maxWidth) {
				$scope.embed.width = config.embed.maxWidth;
				$scope.embed.widthResult = '100%';
			}else {
				$scope.embed.width = $scope.embed.widthResult = w;
			}
		}
	}

	$scope.$watch('embed.width', function (){
		if ($scope.embed.width == config.embed.maxWidth) {
			$scope.embed.widthResult = '100%'
		}else {
			$scope.embed.widthResult = $scope.embed.width;
		}
	});

	$scope.flow.changeHeightResult =  function () {
		var h = parseInt($scope.embed.height);
		if ( h > config.embed.maxHeight) h = config.embed.maxHeight;
		if ( h < config.embed.minHeight) h = config.embed.minHeight;
		$scope.embed.height = h;
	}

	$timeout( function () {
		$('textarea').select();
	}, 100 );

} ] );
