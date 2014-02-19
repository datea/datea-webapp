'use strict';

angular.module('dateaWebApp')
.controller('AccountCtrl'
, [ '$scope'
  , 'User'
  , 'config'
  , 'Api'
, function (
    $scope
  , User
  , config
  , Api
) {

	$scope.account = User.data;

	$scope.account.save = function () {
		var data = {};
		data.email = $scope.account.email;
		data.id    = User.data.id;
		data.success_redirect_url = config.app.url + 'updateUser';
		data.error_redirect_url   = config.app.url;
		User.updateTokenOnTwitterSignup();
		User.updateUser( data )
		.then( function ( response ) {
			console.log( response );
		}, function ( reason ) {
			console.log( reason );
		} )
	}

} ] );
