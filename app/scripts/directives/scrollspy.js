'use strict';

angular.module('dateaWebApp')
.directive('scrollspy', [
  'config'
, function (
  config
) {
	return {
		link: function (scope, element, attributes) {
			$(element).scroll( function () {
				var $this = $(this)
				  , $targets
				  , $titles
				  , givens
				  , currentActive
				  ;
				givens = scope.$eval( attributes.scrollspy );
				$targets = $( givens.targets );
				$titles  = $( givens.titles );
				currentActive = 0;
				angular.forEach( $targets, function ( value, key ) {
					if( $this.scrollTop() > $(value).offset().top ) {
						$( $titles[key] ).addClass('scroll-active');
						currentActive = key;
					} else {
						$( $titles[key] ).removeClass('scroll-active');
					}
				});
			} )
		}
	}
} ] );
