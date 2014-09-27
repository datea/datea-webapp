'use strict';

angular.module('dateaWebApp')
.directive('fileInputWidget', [
  '$rootScope'
, 'config'
, function (
  $rootScope
, config
) {
	return {
		scope: { 
			, callBack   : '&'
			, uploadType : '@'
			, maxImgSize : '@'
		}
		, templateUrl: "views/file-input-widget.html"
		, link: function (scope, element, attrs) {

			var maxImgSize = attrs.maxImgSize ? parseInt(attrs.maxImgSize) : config.maxImgSize;
			var inputType = attrs.inputType ? parseInt(attrs.inputType) : 'image';
			var processFiles;

			FileAPI.event.on(element[0], 'change', function (ev) {
				var files = FileAPI.getFiles(ev);
			});

			FileAPI.event.on(document, 'drop', function (evt){
			  evt.preventDefault();
			  FileAPI.getDropFiles(evt, processFiles);
			});

			processFiles = function (files) {

				FileAPI.filterFiles(files, function(file, info) {
					if (file.type.split('/')[0] === 'image') {
						return true;
					} else if (config.allowedMimetypes.indexOf(file.type) !== -1) {
						return true;
					}else{
						return false;
					}
				}, function (files, rejected) {

						if (files.length) {
							var results = [];
					
							for (var f in files) {
								var file = files[f]
									,	dataUri
									, mime
								;
								var dataUri;
								if (file.type.split('/')[0] == 'image') {
									FileAPI.getInfo(file, function (err, info) { console.log(info)});
									FileAPI.Image(file)
									.rotate('auto')
									.resize(maxImgSize, maxImgSize, 'max')
									.get(function (err, canvas) {
										scope.$apply(function () {
											mime = (file.type == 'image/jpeg' || file.type == 'image/png') ? file.type : 'image/png';
											dataUri = canvas.toDataURL(mime, 1);
											results.push({ data: file, file: dataUri });
											//$rootScope.$broadcast( 'datea:fileLoaded', args);
										});
									});
								}else{
									FileAPI.readAsDataURL(file, function (ev) {
										if (ev.type == 'load') {
											scope.$apply(function () {
												dataUri = ev.result;
												results.push({ data: file, file: dataUri });
												//$rootScope.$broadcast( 'datea:fileLoaded', args);
											});
										}
									});
								}
							}
							$rootScope.$broadcast( 'datea:filesLoaded', results);
						}
				});
			}

			scope.$on('$destroy', function() {
        FileAPI.event.off(element, 'change');
        FileAPI.event.off(document, 'drop');
      });
		}
	}
} ] );
