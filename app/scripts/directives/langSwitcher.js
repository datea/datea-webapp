angular.module("dateaWebApp")
	.directive("daLangSwitcher", ['localStorageService', '$translate', 'config', function(localStorageService, $translate, config) {
		return {
    	 restrict    : "E"
    	,templateUrl : "/views/lang-switcher.html"
    	, controller: function ($scope, $element, $attrs) {
            $scope.availableLocales = config.availableLocales;
            $scope.currentLocale = $translate.use();

            $scope.switchLang = function ($event, lang) {
                $translate.use(lang);
                $scope.currentLocale = lang;
                localStorageService.set('locale', lang);
            }
        }
    }
} ] );