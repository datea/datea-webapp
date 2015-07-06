angular.module('dateaWebApp')
.controller('HeadCtrl', [
	'$scope'
, 'shareMetaData'
, '$timeout'
, '$rootScope' 
, function ($scope, shareMetaData, $timeout, $rootScope){
	$scope.share = shareMetaData.data;
} ] );
