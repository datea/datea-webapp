angular.module('dateaWebApp')
.controller('LayoutCtrl', ['$scope', '$rootScope', '$location', 'User', 'config', 
	function ($scope, $rootScope, $location, User, config){
		var path
			, basepath
		;
		$rootScope.$on("$locationChangeStart", function(event, next, current) {
            	path = $location.path();
            	if (path == '/') {
            		$scope.autoheight = true;
            		$scope.with_nav = User.isSignedIn();
            	} else {
            		basepath = path.split('/')[1];
            		$scope.autoheight = config.layout_100.indexOf(basepath) == -1 ? true : false;
            		$scope.with_nav = true;
            	}
      			});
} ] );
