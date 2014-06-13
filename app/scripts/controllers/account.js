'use strict';

angular.module('dateaWebApp')
.controller('AccountCtrl'
, [ '$scope'
  , 'User'
  , 'config'
  , 'Api'
  , '$modal'
  , 'localStorageService'
  , '$location'
, function (
    $scope
  , User
  , config
  , Api
  , $modal
  , localStorageService
  , $location
) {

	var ls = localStorageService
	  // fn declarations
	  , updateUserDataFromApi
	  ;

	User.isSignedIn() || $location.path( '/' );

	$scope.flow    = {};
	$scope.account = User.data;
	$scope.alerts  = [];
	$scope.loading = false;

	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.addAlert = function ( givens ) {
		$scope.alerts = [];
		$scope.alerts.push( givens );
	}

	$scope.account.save = function () {
		$scope.loading = true;
		var data = {}
		  , v
		  ;
		data.username     = $scope.account.username;
		data.email        = $scope.account.email;
		data.full_name    = $scope.account.full_name;
		data.image        = $scope.flow.imgData && { image: { data_uri : $scope.flow.img, name : $scope.flow.imgData && $scope.flow.imgData.name } };
		data.bg_image     = $scope.flow.bgImgData && { image: { data_uri : $scope.flow.bgImg, name : $scope.flow.bgImgData && $scope.flow.bgImgData.name } };
		data.message      = $scope.account.message;
		data.url          = $scope.account.url;
		data.url_facebook = $scope.account.url_facebook;
		data.url_twitter  = $scope.account.url_twitter;
		data.url_youtube  = $scope.account.url_youtube;
		data.id           = User.data.id;
		console.log( 'save', data );
		for ( v in data ) {
			if ( data.hasOwnProperty( v ) && !data[v] ) {
				delete data[v];
			}
		}

		!User.data.status && User.updateTokenOnTwitterSignup();

		User.updateUser( data )
		.then( function ( response ) {
			if ( data.email ) {
				if ( !User.data.status ) {
					$modal.open( { templateUrl : 'views/verifyEmailModal.html'
					             , backdrop    : 'static'
					             } );
				}
				// update user object with response and no use updateUserDataFromApi
				// User.updateUserDataFromApi();
				// $location.path( '/' );
				$scope.loading = false;
			} else {
				$scope.addAlert( { type : 'danger'
				                 , msg  : 'Por favor indique un correo válido.'
				                 } );
				$scope.loading = false;
			}
		}, function ( reason ) {
			console.log( reason );
			$scope.loading = false;
		} )
	}

} ] );
