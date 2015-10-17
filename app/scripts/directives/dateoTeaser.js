angular.module("dateaWebApp")
.directive("daDateoTeaser", 
[
  '$rootScope'
, '$location'
, '$modal'
, 'config'
, '$translate'
,	function (
	  $rootScope
	, $location
	, $modal
	, config
	, $translate
) {
	return {
			restrict    : "E"
		, transclude  : true
		, replace     : true
		, templateUrl : "/views/dateo-teaser.html"
		, controller  : function ($scope, $element, $attrs) {
				var checkStatus;

				$scope.teaser = {};

				if ($scope.timeline && $scope.timeline.activeDateo) $scope.dateo = $scope.timeline.activeDateo; 

				$scope.mapPresent = ($attrs.mapPresent) ? $scope.$eval($attrs.mapPresent) : true;
				$scope.detailInline = ($attrs.detailInline) ? $scope.$eval($attrs.detailInline) : true;
				$scope.campaignId = ($attrs.campaignId) ? $scope.$eval($attrs.campaignId) : null;
				$scope.mainTag = ($attrs.mainTag) ? $scope.$eval($attrs.mainTag) : null;
				$scope.createdFormat = config.defaultDateFormat;
				$scope.dateFormat = config.dateFieldFormat;
				//$scope.dateFormat  = $attrs.dateFormat ? $scope.$eval($attr.dateFormat) : config.dateFieldFormat;
				$scope.forceDate = $attrs.forceDate ? $scope.$eval($attrs.forceDate) : false;

				if ($scope.mainTag && $scope.dateo && $scope.dateo.tags.length && $scope.dateo.tags[0] != $scope.mainTag) {
					var i = $scope.dateo.tags.indexOf($scope.mainTag);
					$scope.dateo.tags.splice(i, 1);
					$scope.dateo.tags.unshift($scope.mainTag); 					
				}

				checkStatus = function () {
					var status;
					if ($scope.campaignId && $scope.dateo.admin && $scope.dateo.admin[$scope.campaignId]) {
						status = $scope.dateo.admin[$scope.campaignId].status;
						if (status != 'new') {
							$translate(['DATEO.SOLVED', 'DATEO.REVIEWED'])
							.then(function(t) {
								$scope.flow.status = {
								  msg    : status == 'reviewed' ? t['DATEO.REVIEWED'] : t['DATEO.SOLVED']
								, type   : status
							} 
							});
						} 
					}
				};

				$scope.focusDateo = function () {
					$rootScope.$broadcast('focus-dateo', {id: $scope.dateo.id});
				};

				$scope.openDetail = function () {
					if ($scope.detailInline) {
						$rootScope.$broadcast('open-dateo-detail', {id: $scope.dateo.id});
					}else {
						console.log($scope.dateo.user.username+'/dateos/'+$scope.dateo.id);
						$location.path($scope.dateo.user.username+'/dateos/'+$scope.dateo.id);
					}
				};

				$scope.teaser.imgDetail = function ( img ) {
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
				};

				checkStatus();
		}
	}
} ] );
