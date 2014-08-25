angular.module("dateaWebApp")
	.directive("daFollow", ['Api', 'User', '$location', 'localStorageService', function(Api, User, $location, localStorageService) {
		return {
    	 restrict    : "E"
    	,templateUrl : "/views/follow-button.html"
    	,replace		 : true
    	,scope: {
    		btnClass 				: '@'
    		,followObj    	: '='
    		,followId				: '@'
    	}

    	,link: function (scope, element, attrs) {

    		var follow_key;
    		var follow_obj = attrs.followObj;
    		var ls = localStorageService;
    		var nextURL;
    		scope.btn_class   = angular.isDefined(attrs.btnClass) ? attrs.btnClass : '';
    		console.log("BTN CLASS", scope.btn_class);
    		scope.is_following = false;
    		scope.loading     = true;
    		scope.following_changed = false;

    		attrs.$observe('followId', function (fid) {
    			if (angular.isDefined(fid)) {
    				follow_key = follow_obj + '.' +fid;
    				init_follow();
    			} 
    		});

    		var init_follow = function () {
					Api.follow
					.getFollows({user: User.data.id, follow_key: follow_key})
					.then( function (response) {
						scope.is_following = response.objects.length != 0;
						scope.loading = false;
					}, function (reason) {
						console.log(reason);
					});
				}

    		/* FOLLOW ACTION */
    		var follow = function () {

					if ( User.isSignedIn() && scope.loading == false) {
						scope.loading = true;
						Api.follow
						.doFollow( { follow_key: follow_key} )
						.then( function ( response ) {
							console.log(response);
							User.updateUserDataFromApi();
							scope.loading = false;
							scope.is_following = true;
							scope.following_changed = true;
						}, function ( reason ) {
							$scope.loading = true;
							console.log( reason );
						} );
					} else {
						nextURL = $location.path();
						ls.set( 'nextURL', { path: nextURL, count: 0 } );
						$location.path('/registrate');
					}
				}

				var unfollow = function () {
					if ( !scope.loading ) {
						scope.loading = scope.removing = true;
						Api.follow
						.doUnfollow( { user: User.data.id, follow_key: follow_key} )
						.then( function ( response ) {
							User.updateUserDataFromApi();
							scope.loading = scope.is_following = scope.removing = false;
							scope.following_changed = true;
						}, function ( reason ) {
							scope.loading = true;
							console.log( reason );
						} );
					}
				}

				scope.do_follow_action = function () {
					if (scope.is_following) {
						unfollow();
					} else {
						follow();
					}
				}

    	}	
		}
} ] );
