'use strict';

angular.module('dateaWebApp')
.directive('daJcarousel', [function () {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {

			var setContainerWidth
				, resizeCarousel
				, step = 4
				, $carousel
				;

			$carousel = element.find('.jcarousel');

			var carousel = $carousel.jcarousel({wrap: 'both'});
			element.find('.carousel-next').click(function() {
    		$carousel.jcarousel('scroll', '+='+step, true);
			});
			element.find('.carousel-prev').click(function() {
    		$carousel.jcarousel('scroll', '-='+step, true);
			});
			scope.flow = {};

			scope.onLastCarouselItem = function () {
				resizeCarousel();
			}

			$(window).resize(function () {
				resizeCarousel();
			});

			setContainerWidth = function () {
				var width = element.width();
				var $container = element.find('.carousel-container');	
				console.log("WIDTH", width);

				if (width >= 750) {
					$container.css('width', '300%');
					step = 4;
				} else if (width >= 600 && width < 750) {
					$container.css('width', '400%');
					step = 3;
				} else if (width >= 480 && width < 600) {
					$container.css('width', '600%');
					step = 2;
				} else {
					$container.css('width', '600%');
					step = 2;
				}
			};

			resizeCarousel = function () {
				var itemWidths = 0
					, numItems
					, finalWidth
					, $items = element.find('.carousel-item')
					;

				numItems = $items.size();

				setContainerWidth();
				$items.each(function (e){
					$(this).removeAttr('style');
					itemWidths += $(this).outerWidth();
				});

				finalWidth = parseInt(itemWidths / numItems);

				$items.each(function (e) {
					$(this).css('width', finalWidth+'px');
				});
				$carousel.jcarousel('reload');
			};

		}
	}
} ] );
