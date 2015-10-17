'use strict';

angular.module( 'dateaWebApp' )
.controller( 'ChangePasswordCtrl'
, [ '$scope'
	, 'Api'
	, 'User'
	, '$location'
	, 'config'
	, '$routeParams'
	, 'shareMetaData'
	, '$translate'
, function (
		$scope
	, Api
	, User
	, $location
	, config
	, $routeParams
	, shareMetaData
	, $translate
) {

	$scope.flow     = {};
	$scope.auth     = {};
	$scope.alerts   = [];

	$scope.flow.loading                 = false;
	$scope.flow.validInput              = {};
	$scope.flow.validInput.password     = null;
	$scope.flow.validInput.samePassword = null;

	$scope.flow.changeSuccess           = null;

	$translate('PASSW_PAGE.PAGE_TITLE').then(function (t) {
		shareMetaData.setData({ title : 'Datea | '+t});
	});

	$scope.flow.checkPassword = function () {
		if ( $scope.auth.password ) {
			$scope.flow.validInput.password = /^(?=.*\d)(?=.*[a-z])(?!.*\s).{6,32}$/.test( $scope.auth.password );
			$scope.auth.message = null;
		}
	}

	$scope.flow.checkSamePassword = function () {
		if ( $scope.auth.samePassword ) {
			$scope.flow.validInput.samePassword = $scope.auth.samePassword === $scope.auth.password;
			$scope.auth.message = null;
		}
	}

	$scope.flow.savePasswd = function () {
		var isValid;
		isValid = $scope.form.$valid;

		if (isValid) {
			$scope.flow.loading = true;
			var givens = {
				  uid      : $routeParams.uid
				, token    : $routeParams.token
				, password : $scope.auth.password 
			}

			Api.account.changePassword(givens)
			.then(function (response){
				$scope.flow.changeSuccess = true;
				$scope.flow.loading = false;
			}, function (reason) {
				$scope.flow.changeSuccess = false;
				$scope.flow.loading = false;
			});
		}
	}

} ] );
