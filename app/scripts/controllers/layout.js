angular.module('dateaWebApp')
.controller('LayoutCtrl', ['$scope', '$rootScope', '$location', 'User', 'config', 
	function ($scope, $rootScope, $location, User, config){
		var path
			, basepath
		;
		$scope.flow = {};
		$rootScope.$on("$locationChangeStart", function(event, next, current) {
      	path = $location.path();
      	if (path == '/') {
      		$scope.flow.autoheight = true;
      		$scope.flow.withNav = User.isSignedIn();
      	} else {
      		basepath = path.split('/')[1];
      		$scope.flow.autoheight = config.layout_100.indexOf(basepath) == -1 ? true : false;
      		$scope.flow.withNav = true;
      	}
			});

		$rootScope.$on( 'user:signedOut', function (ev) {
			$scope.flow.withNav = false;
		});
} ] );
