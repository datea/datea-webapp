angular.module("dateaWebApp")
.directive("daDateoTeaser", 
[
	'$rootScope'
,	function (
	$rootScope
) {
	return {
  	  restrict    : "E"
  	, transclude  : true
  	, templateUrl : "/views/dateo-teaser.html"
  	, controller  : function ($scope, $element, $attrs) {
  			$scope.mapPresent = ($attrs.mapPresent) ? $scope.$eval($attrs.mapPresent) : true;
  			
  			$scope.focusDateo = function () {
  				$rootScope.$broadcast('focus-dateo', {index: $scope.$index});
  			}

  			$scope.openDetail = function () {
  				$rootScope.$broadcast('open-dateo-detail', {index: $scope.$index});
  			}
  	}
	}
} ] );
