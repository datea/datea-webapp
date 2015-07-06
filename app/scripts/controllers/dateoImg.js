'use strict';

angular.module('dateaWebApp')
.controller('DateoimgCtrl',
[ '$scope'
, '$modalInstance'
, 'img'
, function (
  $scope
, $modalInstance
, img
) {
	$scope.dateoImg = {};
	$scope.dateoImg.img = img;
}]);
