angular.module("dateaWebApp")
	.directive("daFollow", ['Api', 'User', '$location', 'localStorageService', '$rootScope', '$translate', function(Api, User, $location, localStorageService, $rootScope, $translate) {
		return {
    	 restrict    : "E"
    	,templateUrl : "/views/follow-button.html"
    	,replace		 : true
    	,scope: {
    		  btnClass 			 : '@'
    		, followObj    	 : '='
    		, followId			 : '@'
    		, followLabel    : '@'
    	}

    	, controller: function ($scope, $element, $attrs) {


    		var followKey
    			, followObj
    			, initFollow
    			, follow
    			, unfollow
    			, nextURL
    			, ls
    		;

    		followObj = $attrs.followObj;
    		ls = localStorageService;

    		$scope.btnClass    = angular.isDefined($attrs.btnClass) ? $attrs.btnClass : '';
    		$scope.flow = {}
    		$scope.flow.isFollowing       = false;
    		$scope.flow.loading           = true;
    		$scope.flow.followingChanged  = false;
    		$translate('FOLLOW').then(function (txt) {
    			$scope.flow.followLabel   = $attrs.followLabel ? $attrs.followLabel : txt;
    		});

    		$attrs.$observe('followId', function (fid) {
    			if (angular.isDefined(fid)) {
    				followKey = followObj + '.' +fid;
    				initFollow();
    			} 
    		});

    		var initFollow = function () {
					Api.follow
					.getFollows({user: User.data.id, follow_key: followKey})
					.then( function (response) {
						$scope.flow.isFollowing = response.objects.length != 0;
						$scope.flow.loading = false;
					}, function (reason) {
						console.log(reason);
					});
				}

    		/* FOLLOW ACTION */
    		follow = function () {

					if ( User.isSignedIn() && $scope.flow.loading == false) {
						$scope.flow.loading = true;
						Api.follow
						.doFollow( { follow_key: followKey} )
						.then( function ( response ) {
							User.updateUserDataFromApi();
							$scope.flow.loading = false;
							$scope.flow.isFollowing = true;
							$scope.flow.followingChanged = true;
							$rootScope.$broadcast('user:follow', {followKey: followKey, op: 'follow'});
						}, function ( reason ) {
							$scope.flow.loading = false;
							console.log( reason );
						} );
					} else {
						nextURL = $location.path();
						ls.set( 'nextURL', { path: nextURL, count: 0 } );
						$location.path('/registrate');
					}
				}

				unfollow = function () {
					if ( !$scope.flow.loading ) {
						$scope.flow.loading = $scope.flow.removing = true;
						Api.follow
						.doUnfollow( { user: User.data.id, follow_key: followKey} )
						.then( function ( response ) {
							User.updateUserDataFromApi();
							$scope.flow.loading = $scope.flow.isFollowing = $scope.flow.removing = false;
							$scope.flow.followingChanged = true;
							$rootScope.$broadcast('user:follow', {followKey: followKey, op: 'unfollow'});
						}, function ( reason ) {
							$scope.flow.loading = true;
							console.log( reason );
						} );
					}
				}

				$scope.doFollowAction = function () {
					if ($scope.flow.isFollowing) {
						unfollow();
					} else {
						follow();
					}
				}

				$scope.$on('user:doFollow', function (event, args) {
					//console.log("IS FOLLOWIGN", $scope.flow.isFollowing);
					if (args.followKey === followKey && !$scope.flow.isFollowing) {
						follow();
					}
				})

    	}	
		}
} ] );
