'use strict';

angular.module('dateaWebApp')
.controller('DatearCtrl',
[ '$scope'
, '$modalInstance'
, function (
  $scope
, $modalInstance
) {

$scope.datear = {};

$scope.datear.ok = function () {
	// $modalInstance.close($scope.selected.item);
	$modalInstance.dismiss('cancel');
};

$scope.datear.cancel = function () {
	$modalInstance.dismiss('cancel');
};


}]);
