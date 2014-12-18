'use strict';

angular.module('dateaWebApp')
.controller('FlagFormCtrl',
[ '$scope'
, '$modalInstance'
, 'Api'
, 'flagModalGivens'
, 'User'
, 'localStorageService'
// , 'leafletEvents'
, function (
  $scope
, $modalInstance
, Api
, flagModalGivens
, User
, localStorageService
// , leafletEvents
) {

	$scope.flow = {};

	$scope.flow.doFlag = function () {

		if ($scope.flagform.$valid) {

			$scope.flow.loading = true;
			Api.flag
			.doFlag( { content_type : flagModalGivens.flagObjType
			         , object_id    : flagModalGivens.flagId 
			         , comment      : $scope.flag.comment } )
			.then( function ( response ) {
				$scope.flow.loading = false;
				$scope.flow.success = true;
			}, function ( reason ) {
				console.log( reason );
			} );
		}else{
			$scope.flow.notValid = true;
		}
	};

} ] );
