'use strict';

angular.module('dateaWebApp')
.controller('ProfileCtrl'
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

	$scope.profile = User.data;

	$scope.profile.save = function () {
		var data = {};
		data.email = $scope.profile.email;
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
