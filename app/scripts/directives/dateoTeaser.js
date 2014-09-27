angular.module("dateaWebApp")
.directive("daDateoTeaser", 
[
	'$rootScope'
,	'$location'
, '$modal'
,	function (
		$rootScope
	, $location
	, $modal
) {
	return {
			restrict    : "E"
		, transclude  : true
		, replace     : true
		, templateUrl : "/views/dateo-teaser.html"
		, controller  : function ($scope, $element, $attrs) {
				var checkStatus;

				$scope.mapPresent = ($attrs.mapPresent) ? $scope.$eval($attrs.mapPresent) : true;
				$scope.detailInline = ($attrs.detailInline) ? $scope.$eval($attrs.detailInline) : true;
				$scope.campaignId = ($attrs.campaignId) ? $scope.$eval($attrs.campaignId) : null;

				checkStatus = function () {
					var status;
					if ($scope.campaignId && $scope.dateo.admin && $scope.dateo.admin[$scope.campaignId]) {
						status = $scope.dateo.admin[$scope.campaignId].status;
						if (status != 'new') {
							$scope.flow.status = {
								  msg    : status == 'reviewed' ? 'atendido' : 'solucionado'
								, type   : status
							} 
						} 
					}
				}

				$scope.focusDateo = function () {
					$rootScope.$broadcast('focus-dateo', {index: $scope.$index});
				}

				$scope.openDetail = function () {
					if ($scope.detailInline) {
						$rootScope.$broadcast('open-dateo-detail', {index: $scope.$index});
					}else {
						console.log($scope.dateo.user.username+'/dateos/'+$scope.dateo.id);
						$location.path($scope.dateo.user.username+'/dateos/'+$scope.dateo.id);
					}
				}

				$scope.flow.imgDetail = function ( img ) {
					var givens;

					givens = { templateUrl : 'views/dateo-detail-img.html'
					         , controller  : 'DateoimgCtrl'
					         , resolve     : {
					             img : function () {
					               return img;
					             }
					           }
					         }

					$modal.open( givens );
				}

				checkStatus();
		}
	}
} ] );
