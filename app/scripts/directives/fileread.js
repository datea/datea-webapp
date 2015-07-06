'use strict';

angular.module('dateaWebApp')
.directive('fileread', [
  '$rootScope'
, 'config'
, function (
  $rootScope
, config
) {
	return {
		scope: { 
				fileread   : "="
			, filedata   : "="
			, maxImgSize : '@'
		},
		link: function (scope, element, attrs) {

			var maxImgSize = attrs.maxImgSize ? parseInt(attrs.maxImgSize) : config.maxImgSize;

			FileAPI.event.on(element[0], 'change', function (ev) {
				var file = FileAPI.getFiles(ev)[0]
					,	args
					, mime
					;
				
				if (file.type.split('/')[0] == 'image') {
					FileAPI.getInfo(file, function (err, info) { console.log(info)});
					FileAPI.Image(file)
					.rotate('auto')
					.resize(maxImgSize, maxImgSize, 'max')
					.get(function (err, canvas) {
						scope.$apply(function () {
							scope.filedata = file;
							mime = (file.type == 'image/jpeg' || file.type == 'image/png') ? file.type : 'image/png';
							scope.fileread = canvas.toDataURL(mime, 1);
							args = { data: file, file: scope.fileread };
							$rootScope.$broadcast( 'datea:fileLoaded', args);
						});
					});
				}else{
					FileAPI.readAsDataURL(file, function (ev) {
						if (ev.type == 'load') {
							scope.$apply(function () {
								scope.filedata = file;
								scope.fileread = ev.result;
								args = { data: file, file: scope.fileread };
								$rootScope.$broadcast( 'datea:fileLoaded', args);
							});
						}
					});
				}
			});

			scope.$on('$destroy', function() {
        FileAPI.event.off(element, 'change');
      });
		}
	}
} ] );
