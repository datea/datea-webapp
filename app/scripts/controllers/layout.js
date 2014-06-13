angular.module('dateaWebApp')
.controller('LayoutCtrl', ['$scope', '$rootScope', '$location', 'User', 'config', 
	function ($scope, $rootScope, $location, User, config){

		$rootScope.$on("$locationChangeStart", function(event, next, current) {
            	var path = $location.path();
            	$scope.HEY = path;
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
