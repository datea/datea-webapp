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
  , 'shareMetaData'
, function (
    $scope
  , User
  , config
  , Api
  , $modal
  , localStorageService
  , $location
  , shareMetaData
) {

	var ls = localStorageService
	  // fn declarations
	  , updateUserDataFromApi
	  , buildUserMsgs
	  , activateTab
	  , oldUsername = User.data.username
	  ;

	User.isSignedIn() || $location.path( '/signin' );

	$scope.flow          = {};
	$scope.account       = User.data;
	$scope.alerts        = [];
	$scope.flow.loading  = false; 
	$scope.accountMsgs   = config.accountMsgs;
	$scope.flow.statusBeingChecked  = !User.data.status;
	$scope.flow.activeTab = $location.search().tab || 'user';

	shareMetaData.setData({ title : 'Datea | configuración de cuenta'});
  $scope.htmlReady();

	$scope.flow.openTab = function (tab) {
		$location.search({tab: tab});
	}
	$scope.$on('$routeUpdate', function () {
		activateTab($location.search().tab);
	});
	
	activateTab = function (tab) {
		tab = tab ? tab : 'user';
		$scope.flow.activeTab = {'user': false, 'profile': false, 'notifications': false};
		$scope.flow.activeTab[tab] = true;
	}
	activateTab($location.search().tab);

	buildUserMsgs = function (status, statusChanged) {
		$scope.flow.userIsNew     = User.isNew;
		$scope.flow.userStatus    = status;
		$scope.flow.authProvider  = User.data.authProvider || null;
		$scope.flow.statusChanged = statusChanged;
		$scope.flow.submitLabel   = status === 1 ? 'Guardar' : 'Enviar';
		$scope.flow.hasEmail      = !!User.data.email;
	}

	if (User.data.status === 1) buildUserMsgs(1, false);

	$scope.$on('user:statusCheck', function (ev, args) {
		buildUserMsgs(args.status, args.changed);
		$scope.flow.statusBeingChecked = false;
	});

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
		data.username        = $scope.account.username;
		data.email           = $scope.account.email;
		data.full_name       = $scope.account.full_name;
		data.image           = $scope.flow.imgData && { image: { data_uri : $scope.flow.img, name : $scope.flow.imgData && $scope.flow.imgData.name } };
		data.bg_image        = $scope.flow.bgImgData && { image: { data_uri : $scope.flow.bgImg, name : $scope.flow.bgImgData && $scope.flow.bgImgData.name } };
		data.message         = $scope.account.message;
		data.url             = $scope.account.url;
		data.url_facebook    = $scope.account.url_facebook;
		data.url_twitter     = $scope.account.url_twitter;
		data.url_youtube     = $scope.account.url_youtube;
		data.notify_settings = $scope.account.notify_settings;
		data.id              = User.data.id;

		for ( v in data ) {
			if ( data.hasOwnProperty( v ) && !data[v] ) {
				delete data[v];
			}
		}

		!User.data.status && User.updateTokenOnTwitterSignup();

		if ( data.username && data.email ) {
			User.updateUser( data )
			.then( function ( response ) {

				if (response.token) {
					User.updateHeader(response.username, response.token);
				}

				if ( data.email && User.data.status === 0) {
					$modal.open( { templateUrl : 'views/verifyEmailModal.html'
						             , backdrop    : 'static'
						             } );
						//$scope.addAlert({type: 'success', msg: config.accountMsgs.checkEmailMsg});
				// update user object with response and no use updateUserDataFromApi
				// User.updateUserDataFromApi();
				// $location.path( '/' );
				} else if (!data.email) {
					$scope.addAlert( { type : 'danger'
					                 , msg  : 'Por favor indique un correo válido.'
					                 } );
				} else {
					$location.url("/"+data.username);
				}
				$scope.loading = false;
			}, function ( reason ) {
				var error;
				if (reason.status === 400) {
					if (reason.data && reason.data.error && reason.data.error.length) {
						error = reason.data.error;
						if (error === 'Duplicate email') {
							$scope.addAlert({type: 'warning', 'msg': config.accountMsgs.duplicateEmailMsg});
						}
						if (error === 'Duplicate username') {
							$scope.addAlert({type: 'danger', 'msg': config.accountMsgs.duplicateUsernameMsg});
						}
					}else{
						$scope.addAlert({type:'danger', 'msg': config.unknownErrorMsg});
					}
				}
				$scope.loading = false;
			} )
		}
	}
} ] );
