'use strict';

angular.module('dateaWebApp')
.controller('ShareCtrl',
[ '$scope'
, '$modalInstance'
, 'shareModalGivens'
, function (
  $scope
, $modalInstance
, shareModalGivens
) {

	$scope.share = {};
	$scope.share.url         = shareModalGivens.url;
	$scope.share.title       = shareModalGivens.title;
	$scope.share.description = shareModalGivens.description;
	$scope.share.image       = shareModalGivens.image;

} ] );
