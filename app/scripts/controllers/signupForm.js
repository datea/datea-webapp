'use strict';

angular.module('dateaWebApp')
.controller('SignupformCtrl',
[ '$scope'
, '$http'
, 'localStorageService'
, 'Api'
, 'config'
, '$location'
, 'User'
, 'shareMetaData'
, '$translate'
, function (
  $scope
, $http
, localStorageService
, Api
, config
, $location
, User
, shareMetaData
, $translate
) {

	var ls = localStorageService
	  ;

	$scope.auth = {};
	$scope.auth.messages = {};
	$scope.flow = {};
	$scope.flow.validInput = {};

	$scope.flow.validInput.username     = null;
	$scope.flow.validInput.email        = null;
	$scope.flow.validInput.password     = null;
	$scope.flow.validInput.samePassword = null;
	$scope.flow.loading                 = false;
	$scope.flow.registerSuccess         = false;

	User.isSignedIn() && $location.path( '/' );

	$translate(['REGISTER' , 'REGISTER_FORM_PAGE.PAGE_DESC']).then(function (t) {
		shareMetaData.setData({title: "Datea | "+t.REGISTER, description: t['REGISTER_FORM_PAGE.PAGE_DESC']});
	});
	
	$scope.auth.checkUsername = function () {
		if ( $scope.auth.bio ) {
			$scope.auth.bio = $scope.auth.bio.replace(/ /g,'');
			Api.account.register
			.usernameExists( { username: $scope.auth.bio } )
			.then( function ( response ) {
				$scope.flow.validInput.username = !response.result;
				$scope.auth.messages.usernameExists = !$scope.flow.validInput.username;
				$scope.form.$setValidity( 'usernameExists', $scope.flow.validInput.username );
			}, function ( reason ) {
				console.log( reason );
			} );
		} else {
			$scope.flow.validUsername = null;
		}
	}

	$scope.auth.checkEmail = function () {
		var isValid;
		isValid = config.regex.email.test( $scope.auth.email );
		//$scope.auth.message = null;
		if (isValid) {
			Api.account.register.emailExists({email: $scope.auth.email})
			.then (function (response) {
				$scope.flow.validInput.email = !response.result;
				$scope.auth.messages.emailExists = !$scope.flow.validInput.email;
				$scope.form.$setValidity( 'emailExists', $scope.flow.validInput.email );
			})
		}
	}

	$scope.auth.checkPassword = function () {
		if ( $scope.auth.password ) {
			$scope.flow.validInput.password = /^(?=.*\d)(?=.*[a-z])(?!.*\s).{6,32}$/.test( $scope.auth.password );
			$scope.auth.message = null;
		}
	}

	$scope.auth.checkSamePassword = function () {
		if ( $scope.auth.samePassword ) {
			$scope.flow.validInput.samePassword = $scope.auth.samePassword === $scope.auth.password;
			$scope.auth.message = null;
		}
	}

	$scope.auth.save = function () {
		var data
		  , isValid
		  ;

		isValid = $scope.form.$valid;

		data = { username             : $scope.auth.bio
		       , email                : $scope.auth.email
		       , password             : $scope.auth.password
		       , success_redirect_url : config.app.url + 'updateUser'
		       , error_redirect_url   : config.app.url
		       }

		if ( isValid && $scope.flow.validInput.username ) {
			$scope.flow.loading = true;
			Api.account.register.createUser( data )
			.then( function ( response ) {
				if ( response.status === 201 ) {
					ls.set( 'user', response.user );
					$scope.flow.registerSuccess = true;
					$scope.flow.loading = false;
					//$location.path( '/signin' );
				}
			}
			, function ( reason ) {
				if ( reason.status === 400 ) {
					$scope.auth.message = config.signupForm.validationMsgs.http400;
				}
				$scope.flow.loading = false;
				console.log( 'reason', reason );
			} )
		}
	}

} ] );
