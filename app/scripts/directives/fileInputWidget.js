'use strict';

angular.module('dateaWebApp')
.directive('fileInputWidget', [
  '$rootScope'
, 'config'
, '$timeout'
, function (
  $rootScope
, config
, $timeout
) {
	return {
			restrict: "E"
		, templateUrl: "views/file-input-widget.html"
		, scope: { 
			  callback   : '&'
			, fileType   : '@'
			, maxImgSize : '@'
			, maxNumber  : '@'
		}
		, link: function (scope, element, attrs) {

			var maxImgSize = attrs.maxImgSize ? parseInt(attrs.maxImgSize) : config.maxImgSize;
			scope.maxNumber = attrs.maxNumber ? parseInt(attrs.maxNumber) : 20;
			var processFiles;
			scope.flow = {};

			attrs.$observe('maxNumber', function(num) {
				scope.maxNumber = num ? parseInt(num) : 20;
			});

			attrs.$observe('fileType', function (ftype) {
				scope.fileType = ftype ? ftype : 'image';
				if (scope.fileType === 'image') {
					scope.flow.accept = 'image/*';
					if (!scope.maxNumber || scope.maxNumber > 1) {
						scope.flow.dragMessage = 'FILEINPUT.IMAGES.DRAG_MSG';
						scope.flow.btnMessage = 'FILEINPUT.IMAGES.BTN_MSG';
					}else{
						scope.flow.dragMessage = 'FILEINPUT.IMAGE.DRAG_MSG';
						scope.flow.btnMessage = 'FILEINPUT.IMAGE.BTN_MSG';
					}
				}else{
					scope.flow.accept = config.allowedMimetypes.join(',');
					if (!scope.maxNumber || scope.maxNumber > 1) {
						scope.flow.dragMessage = 'FILEINPUT.FILES.DRAG_MSG';
						scope.flow.btnMessage = 'FILEINPUT.FILES.BTN_MSG';
					}else{
						scope.flow.dragMessage = 'FILEINPUT.FILE.DRAG_MSG';
						scope.flow.btnMessage = 'FILEINPUT.FILE.BTN_MSG';
					}
				}
			});

			$timeout(function () {
				FileAPI.event.on(element.find('#inputFileElement')[0], 'change', function (ev) {
					var files = FileAPI.getFiles(ev);
					processFiles(files);
				});
			}, 100);
			/*
			$(document).dnd(function (over){
				scope.$apply(function() {
					scope.flow.isOver = over;
				});
				}, function (files){
					processFiles(files);
			});*/

			
			$(document).on('dragenter', function (ev) {
				ev.preventDefault();
				ev.stopPropagation();
				scope.$apply(function () {
					scope.flow.isOver = true;
				});
			});

			$(document).on('dragover', function (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			});

			$(document).on('drop', function (ev) {
				scope.$apply(function () {
					scope.flow.isOver = false;
					scope.flow.loading = true;
				});
				var files    = []
					, fileList = ev.originalEvent.dataTransfer.files
					;
				ev.preventDefault();
				ev.stopPropagation();
				
				for (var i=0; i < fileList.length; i++) {
					files.push(fileList[i]);
				}
				processFiles(files);
			});

			processFiles = function (files) {
				FileAPI.filterFiles(files, function(file, info) {
					if (scope.fileType === 'image' && file.type.split('/')[0] === 'image') {
						return true;
					} else if (scope.fileType === 'file' && config.allowedMimetypes.indexOf(file.type) !== -1) {
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
									FileAPI.Image(file)
									.rotate('auto')
									.resize(maxImgSize, maxImgSize, 'max')
									.get(function (err, canvas) {
										// no gifs
										if (canvas) {
											mime = (file.type == 'image/jpeg' || file.type == 'image/png') ? file.type : 'image/png';
											dataUri = canvas.toDataURL(mime, 1);
											results.push({ data: file, file: dataUri, type: 'image' });
											if (results.length === files.length) {
												scope.callback({files: results});
												$timeout(function () {
													scope.flow.loading = false;
												}, 0, true);
											}
										}
									});
								}else{
									FileAPI.readAsDataURL(file, function (ev) {
										if (ev.type == 'load') {
											dataUri = ev.result;
											results.push({ data: file, file: dataUri, type: 'file' });
											if (results.length === files.length) {
												scope.callback({files: results});
												$timeout(function () {
													scope.flow.loading = false;
												}, 0, true);
											}
										}
									});
								}
							}
						}else{
							$timeout(function () {
								scope.flow.loading = false;
							}, 0, true);
						}
				});
			}

			scope.$on('$destroy', function() {
        FileAPI.event.off(element, 'change');
        $(document).off('drop');
        $(document).off('dragover');
        $(document).off('dragenter');
      });
		}
	}
} ] );
