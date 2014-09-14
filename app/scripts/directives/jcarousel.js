'use strict';

angular.module('dateaWebApp')
.directive('daJcarousel', [function () {
	return {
		  restrict: 'A'
		, link: function (scope, element, attrs) {

				var setContainerWidth
					, step = 4
					, $carousel
					;

				scope.carousel = {};

				$carousel = element.find('.jcarousel');
				$carousel.jcarousel({wrap: 'both'});

				scope.carousel.goToNext = function () {
					$carousel.jcarousel('scroll', '+='+step, true);
				}

				scope.carousel.goToPrev = function () {
					$carousel.jcarousel('scroll', '-='+step, true);
				}

				scope.carousel.onLastCarouselItem = function () {
					scope.resizeCarousel();
				}

				$(window).resize(scope.resizeCarousel);

				setContainerWidth = function () {
					var width = element.width();
					var $container = element.find('.carousel-container');	

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

				scope.resizeCarousel = function () {
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
		, controller : function ($scope, $element, $attrs ) {

			$scope.$on("destroy", function () {
				$(window).off($scope.resizeCarousel);
			});
		}
	}
} ] );
