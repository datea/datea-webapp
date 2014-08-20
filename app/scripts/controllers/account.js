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
	  , buildUserMsgs
	  ;

	//User.isSignedIn() || $location.path( '/' );

	$scope.flow          = {};
	$scope.account       = User.data;
	$scope.alerts        = [];
	$scope.flow.loading  = false; 
	$scope.accountMsgs   = config.accountMsgs;
	$scope.flow.statusBeingChecked  = !User.data.status;

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
		console.log("USER STATUS CHECK", args);
		buildUserMsgs(args.status, args.changed);
		$scope.flow.statusBeingChecked = false;
	});

	console.log("USER DATA", User);

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

		for ( v in data ) {
			if ( data.hasOwnProperty( v ) && !data[v] ) {
				delete data[v];
			}
		}

		!User.data.status && User.updateTokenOnTwitterSignup();

		if ( data.username && data.email ) {
			User.updateUser( data )
			.then( function ( response ) {
				console.log("CONFIG SAVE RESPONSE", response);
				if ( data.email ) {
					if ( User.data.status === 0) {
						$modal.open( { templateUrl : 'views/verifyEmailModal.html'
						             , backdrop    : 'static'
						             } );
						$scope.addAlert({type: 'success', msg: config.accountMsgs.checkEmailMsg});
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
				var error;
				console.log("CONFIG SAVE ERROR", reason);
				if (reason.status === 400) {
					if (reason.data && reason.data.error && reason.data.error.length) {
						error = reason.data.error[0];
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
