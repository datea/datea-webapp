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
  , '$translate'
, function (
    $scope
  , User
  , config
  , Api
  , $modal
  , localStorageService
  , $location
  , shareMetaData
  , $translate
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

	$translate("SETTINGS_PAGE.TITLE", function (t) {
		shareMetaData.setData({ title : 'Datea | '+t});
	});

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
		$scope.flow.hasEmail      = !!User.data.email;

		$translate(status === 1 ? 'SETTINGS_PAGE.SAVE_BTN' : 'SETTINGS_PAGE.SUBMIT_BTN').then(function (t) {
		   	$scope.flow.submitLabel = t;
		});
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
					$translate('ACCOUNT_MSG.EMAIL_INVALID').then(function (msg) {
						$scope.addAlert( { type : 'danger', msg  : msg});
					});
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
							$translate('ACCOUNT_MSG.EMAIL_EXISTS', function (msg) {
								$scope.addAlert({type: 'danger', 'msg': msg});
							});
						}
						if (error === 'Duplicate username') {
							$translate('ACCOUNT_MSG.DUPLICATE_USER', function (msg) {
								$scope.addAlert({type: 'danger', 'msg': msg});
							});
						}
					}else{
						$scope.addAlert({type:'danger', 'msg': config.unknownErrorMsg});
						$translate('ERROR.UNKNOWN', function (msg) {
							$scope.addAlert({type: 'danger', 'msg': msg});
						});
					}
				}
				$scope.loading = false;
			} )
		}
	}
} ] );
