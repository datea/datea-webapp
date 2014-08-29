angular.module('dateaWebApp')
.controller('HeadCtrl', [
	'$scope'
, 'shareMetaData' 
, function ($scope, shareMetaData){
	$scope.share = shareMetaData.data;
} ] );
