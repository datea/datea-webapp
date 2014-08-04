angular.module("dateaWebApp")
.directive("daDateoTeaser", 
[
	'$rootScope'
,	'$location'
,	function (
		$rootScope
	, $location
) {
	return {
  	  restrict    : "E"
  	, transclude  : true
  	, templateUrl : "/views/dateo-teaser.html"
  	, controller  : function ($scope, $element, $attrs) {
  			$scope.mapPresent = ($attrs.mapPresent) ? $scope.$eval($attrs.mapPresent) : true;
  			$scope.detailInline = ($attrs.detailInline) ? $scope.$eval($attrs.detailInline) : true;
  			
  			$scope.focusDateo = function () {
  				$rootScope.$broadcast('focus-dateo', {index: $scope.$index});
  			}

  			$scope.openDetail = function () {
  				if ($scope.detailInline) {
  					$rootScope.$broadcast('open-dateo-detail', {index: $scope.$index});
  				}else {
  					$location.path($scope.dateo.user.username+'/dateos/'+$scope.dateo.id);
  				}
  			}
  	}
	}
} ] );
