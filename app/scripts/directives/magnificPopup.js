'use strict';

angular.module('dateaWebApp')
.directive('imageGallery', function () 
{ return {
	  restrict: 'A'
	, link: function (scope, element, attrs) {

			element.magnificPopup({
					type     : 'image'
				, delegate : '.slide'
				, gallery  : { enabled : true, preload: [0,2] }
			});
		}
	}
} );
