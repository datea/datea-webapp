angular.module('dateaWebApp')
.controller('HeadCtrl', [
	'$scope'
, 'shareMetaData' 
, function ($scope, shareMetaData){
	console.log("SHARE META DATA", shareMetaData);
	$scope.share = shareMetaData.data;
} ] );
