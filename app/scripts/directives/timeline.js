angular.module("dateaWebApp")
.directive("daTimeline", 
[
  '$rootScope'
, 'config'
, '$timeout'
, 'Piecluster'
, '$sce'
, '$document'
,	function (
	  $rootScope
	, config
	, $timeout
	, Piecluster
	, $sce
	, $document
) {
	return {
	  restrict    : "E"
	, templateUrl : "/views/timeline.html"
	, scope       : {
		  dateos 			: '&'
		, tags        : '&'
		, campaign    : '&'
		, loading     : '='
	}

	, link: function ($scope, $element, $attrs) {

		var mouseDragPos
			, accel   = 0
			, deAccel = -1
			, $barEl = $('.timeline-bar')
			, clusterSizeRange
			, activeMinInterval = '1h'
			, dateoList = []
			, isScrolling = false
		;

		clusterSizeRange = d3.scale.linear()
			  .domain( [0, 100] )
			  .range( [30, 55] )
			  .clamp( true );

		$scope.timeline = {};
		$scope.bar = {};
		$scope.bar.dragging = false;
		$scope.bar.left = 0;

		$scope.bar.width = window.innerWidth;
		$scope.bar.style = {left: '0', width: $scope.bar.width+'px'};
		$scope.bar.timeNotches = {};

		$scope.slider = {};

		$scope.activeDateos = [{}, {}, {}];

		$scope.bar.startDrag = function ($ev) {
			$scope.bar.dragging = true;
			mouseDragPos = $ev.screenX;
			$ev.preventDefault();
			$ev.stopPropagation();
			$scope.bar.style.cursor = 'col-resize';
		};

		$scope.bar.mouseMoving = function ($ev) {

			var isInside = $scope.bar.left < 1 && $scope.bar.left + $scope.bar.width >= window.innerWidth;
			if ($scope.bar.dragging) updateIntervals();

			if ($scope.bar.dragging && isInside) {
				accel = $ev.screenX - mouseDragPos;
				$scope.bar.left += accel;
				setBarStyle();
				mouseDragPos = $ev.screenX;
			}else if ($scope.bar.dragging){
				if ($scope.bar.left > 0) {
					$scope.bar.left = 0;
				}else{
					$scope.bar.left =  window.innerWidth - $scope.bar.width;
				}
				setBarStyle();
				$scope.bar.dragging = false;
				delete $scope.bar.style.cursor;
				$ev.preventDefault();
				$ev.stopPropagation();
			}
			$scope.bar.mouseX = $ev.pageX || $ev.layerX;
		};

		$scope.bar.stopDrag = function ($ev) {
			$scope.bar.dragging = false;
			$ev.preventDefault();
			$ev.stopPropagation();
			delete $scope.bar.style.cursor;
		};

		var wheelTimeout = false;
		
		$scope.bar.mousewheel = function($ev, $delta, $deltaX, $deltaY) {

			if (isScrolling) {
				if (scrollingTimeout) $timeout.cancel(scrollingTimeout);
				scrollingTimeout = $timeout(function () {
					isScrolling = false;
				}, 500);

			}else{

				$ev.preventDefault();
				$ev.stopPropagation();

				var growth = ($deltaY + 2*(($deltaY/Math.abs($deltaY)) * ($scope.bar.width/ window.innerWidth))) * 12;
				var center = $scope.bar.mouseX - $scope.bar.left;

				weightedZoom(growth, center);
				updateIntervals();

				if (wheelTimeout) $timeout.cancel(wheelTimeout);
				wheelTimeout = $timeout(function () {
					updateClusters();
				}, 500);
			}
		};

		var scrollingTimeout = false;

		$document.on('scroll', function() {
			isScrolling = true;
			if (scrollingTimeout) $timeout.cancel(scrollingTimeout);
			scrollingTimeout = $timeout(function () {
				isScrolling = false;
			}, 500);
		});

		var weightedZoom = function (growth, center) {
			var balanceFactor;
			var rightEdge = $scope.bar.left + $scope.bar.width;
			var onScreenTime = (window.innerWidth / $scope.bar.width) * Bounds.timespan();
			var isInsideLeft = $scope.bar.left <= 0;
			var isInsideRight = rightEdge >= window.innerWidth;

			// behave normal
			if (isInsideLeft || isInsideRight) {
				if (isInsideLeft && !isInsideRight) {
					balanceFactor = 0;
				}else if (!isInsideLeft && isInsideRight) {
					balanceFactor = 1;
				}else{
					balanceFactor = center / $scope.bar.width;
				}
				$scope.bar.left -= balanceFactor*growth;
				$scope.bar.width += growth;
			}else{
				$scope.bar.left = 0;
				$scope.bar.width = window.innerWidth;
			}
			$scope.bar.left = $scope.bar.left > 0 ? 0 : $scope.bar.left;
			$scope.bar.width = $scope.bar.width < window.innerWidth ? window.innerWidth : $scope.bar.width;
			setBarStyle();
		};

		var updateClusters = function (activeDateoId) {

			var activeDateoId = activeDateoId ? activeDateoId : $scope.activeDateos[1].id;
			var clusters = {};

			_.each(dateoList, function(dateo) {
				var px = Bounds.project(dateo.timestamp,1) * $scope.bar.width;
				var idx = parseInt(px/50);
				if (clusters[idx]) { 
					clusters[idx].dateos.push(dateo)
				}else{
					clusters[idx] = {dateos: [dateo]};
				}  
			});

			clusters = _.each(clusters, function (cluster, gridNum) {

				var dataObj = {};
				_.each(cluster.dateos, function (dateo) {
					_.each(dateo.tags, function (tag) {
						if (tag != $scope.campaign().main_tag.tag && !!$scope.tags()[tag]) {
							if (!!dataObj[tag]) {
								dataObj[tag].value ++;
							}else{
								dataObj[tag] = {value : 1, tag: tag};
							}
						}
					});
					if (dateo.id == activeDateoId) cluster.isActive = true;
				});
				
				var data = _.values(dataObj)
					, d    = cluster.dateos.length > 1 ? Math.round(clusterSizeRange(cluster.dateos.length)) : 20;

				if (!data.length) {
					data = [{value: cluster.dateos.length, tag: 'Otros'}];
				}

				var pieData = {
					  n             : cluster.dateos.length
					, r             : d / 2
					, d             : d
					, data          : data
					, tags          : $scope.tags()
					, secondaryTags : $scope.tags()
					, opacity				: 1
				};

				cluster.html = Piecluster.makeSVGPie(pieData);
				cluster.html = $sce.trustAsHtml(cluster.html);

				if (cluster.dateos.length > 1) {
					var leftPx = gridNum * 50 + 25;
				}else{
					var leftPx = Bounds.project(cluster.dateos[0].timestamp, $scope.bar.width);
				}
				cluster.style = {
					  top    : -pieData.r + 'px'
					, height :  pieData.d + 'px'
					, left   : ((leftPx - pieData.r) / $scope.bar.width)*100 + '%'
				}
				if (cluster.isActive) {
					$scope.bar.activePosStyle = {left: (leftPx / $scope.bar.width)*100 + '%'};
				}
			});
			$scope.clusters = clusters;
		};

		//scope.timeline = {};

		// A utility obj for storing the extent of the timeline.
		var Bounds = {
	      min : +Infinity
	    , max : -Infinity
	    , extend : function (num) {
	    	this.min = Math.min(num, this.min);
	    	this.max = Math.max(num, this.max);
	    }
	    , timespan : function () {
	    	return this.max - this.min;
	    }
	    , project : function (num, mult) {
	    	mult = mult || 100;
	    	return mult*(num - this.min) / this.timespan();
	    }
	    , reset : function () {
	    	this.min = +Infinity;
	    	this.max = -Infinity;
	    }
	  };

	// days
	// 0.045 -> hours, every minute
  	// 0.09 -> hours, every 5 minutes 
  	// 0.12 -> hours, 15 minutes
  	// 1.5 -> day, complete hours
  	// 3 -> day, hours each 6
  	// 6 -> mes, dias
  	// 60 -> mes, each 7 days
  	// 180 -> año, meses
  	// 1080 -> decada, año
  	// 12000 -> siglo, decada

	  var timeNotchModes = {

	  	1544000 : { // hours, every minute
	  		top: {
	  			interval: '1h',
	  			format  : 'ha - d.M.yy' 
	  		},
	  		bottom: {
	  			interval: '1m',
	  			format  : 'm'
	  		}
	  	},
	  	3888000 : { // hours, every 5 minutes
	  		top: {
	  			interval: '1h',
	  			format  : 'H\'h\' - d MMM yyyy' 
	  		},
	  		bottom: {
	  			interval: '5m',
	  			format  : 'm'
	  		}
	  	},
	  	11600000 : { // hours, every 15 minutes
	  		top: {
	  			interval: '1h',
	  			format  : 'H\'h\' - d MMM yyyy'
	  		},
	  		bottom: {
	  			interval: '15m',
	  			format  : 'm'
	  		}
	  	},
	  	21600000 : { // days, every hour
	  		top: {
	  			interval: '1d',
	  			format  : 'd MMM yyyy'
	  		},
	  		bottom: {
	  			interval : '1h',
	  			format   : 'H'
	  		}
	  	},
	  	103680000 : { // days, every 6 hours
	  		top: {
	  			interval: '1d',
	  			format  : 'd MMM yyyy'
	  		},
	  		bottom: {
	  			interval : '6h',
	  			format   : 'H'
	  		}
	  	},
	  	518400000 : { // month, every day
	  		top: {
	  			interval: '1M',
	  			format  : 'MMMM yyyy'
	  		},
	  		bottom: {
	  			interval: '1d',
	  			format  : 'd' 
	  		}
	  	},
	  	5184000000 : { // month, every 7 days
	  		top: {
	  			interval: '1M',
	  			format  : 'MMMM yyyy'
	  		},
	  		bottom: {
	  			interval: '7d',
	  			format  : 'd' 
	  		}
	  	},
	  	15552000000 : { // year, every month
	  		top: {
	  			interval: '1y',
	  			format  : 'yyyy'
	  		},
	  		bottom: {
	  			interval : '1M',
	  			format   : 'MMM'
	  		}
	  	},
	  	93312000000 : { // decade, year
	  		top: {
	  			interval : '10y',
	  			format   : 'yyyy\'s\''
	  		},
	  		bottom: {
	  			interval : '1y',
	  			format   : 'yy'
	  		}
	  	},
	  	1036800000000 : { // century, decades
	  		top: {
	  			interval : '100y',
	  			format   : 'yyyy\'s\''
	  		},
	  		bottom: {
	  			interval : '10y',
	  			format   : 'yy\'s\''
	  		}	
	  	}
	  };

	  var notchRanges = Object.keys(timeNotchModes).map(function (k) {return parseInt(k);});
	  notchRanges.sort(function (a,b){ return a-b;});

	  var d = new Date();
	  var tzoffset = d.getTimezoneOffset() * 60 * 1000;

	  var intervalFunc = {

	  	'1m' : function (start, end) {
	  		var dates = [];
	  		var ival = 60000;
	  		var numResults = Math.ceil((end - start) / ival);
	  		var startDate = moment(parseInt(start / ival)*ival);
	  		startDate.startOf('minute');
	  		console.log('startDate', startDate);
	  		dates.push(startDate.toDate());
	  		for (var i = 0; i < numResults; i++) {
	  			var nextDate = moment(dates[i]);
	  			nextDate.add(ival, 'ms');
	  			dates.push(nextDate.toDate());
	  		}
	  		return dates;
	  	},
	  	'5m' : function (start, end) {
	  		var dates = [];
	  		var ival = 300000;
	  		var start = parseInt(start / ival)*ival - tzoffset;
	  		var numResults = Math.ceil((end - start) / ival);
	  		var startDate = moment(start);
	  		startDate.startOf('minute');
	  		console.log('startDate', startDate);
	  		dates.push(startDate.toDate());
	  		for (var i = 0; i < numResults; i++) {
	  			var nextDate = moment(dates[i]);
	  			nextDate.add(ival, 'ms');
	  			dates.push(nextDate.toDate());
	  		}
	  		return dates;
	  	},
	  	'15m' : function (start, end) {
	  		var dates = [];
	  		var ival = 900000;
	  		var start = parseInt(start / ival)*ival - tzoffset;
	  		var numResults = Math.ceil((end - start) / ival);
	  		var startDate = moment(start);
	  		startDate.startOf('hour');
	  		console.log('startDate', startDate);
	  		dates.push(startDate.toDate());
	  		for (var i = 0; i < numResults; i++) {
	  			var nextDate = moment(dates[i]);
	  			nextDate.add(ival, 'ms');
	  			dates.push(nextDate.toDate());
	  		}
	  		return dates;
	  	},
	  	'1h' : function (start, end) {
	  		var dates = [];
	  		var ival = 3600000;
	  		var start = parseInt(start / ival)*ival - tzoffset;
	  		var numResults = Math.ceil((end - start) / ival);
	  		var startDate = moment(start);
	  		startDate.startOf('hour');
	  		console.log('startDate', startDate);
	  		dates.push(startDate.toDate());
	  		for (var i = 0; i < numResults; i++) {
	  			var nextDate = moment(dates[i]);
	  			nextDate.add(ival, 'ms');
	  			dates.push(nextDate.toDate());
	  		}
	  		return dates;
	  	},
	  	'6h': function (start, end) {
	  		var dates = [];
	  		var ival = 21600000;
	  		var start = parseInt(start / ival)*ival - tzoffset;
	  		var numResults = Math.ceil((end - start) / ival);
	  		var startDate = moment(start);
	  		startDate.startOf('hour');
	  		console.log('startDate', startDate);
	  		dates.push(startDate.toDate());
	  		for (var i = 0; i < numResults; i++) {
	  			var nextDate = moment(dates[i]);
	  			nextDate.add(ival, 'ms');
	  			dates.push(nextDate.toDate());
	  		}
	  		return dates;
	  	},
	  	'12h': function (start, end) {
	  		var dates = [];
	  		var ival = 43200000;
	  		var start = parseInt(start / ival)*ival - tzoffset;
	  		var numResults = Math.ceil((end - start) / ival);
	  		var startDate = moment(start);
	  		startDate.startOf('hour');
	  		console.log('startDate', startDate);
	  		dates.push(startDate.toDate());
	  		for (var i = 0; i < numResults; i++) {
	  			var nextDate = moment(dates[i]);
	  			nextDate.add(ival, 'ms');
	  			dates.push(nextDate.toDate());
	  		}
	  		return dates;
	  	},
	  	'1d': function (start, end) {
	  		var dates = [];
	  		var ival = 86400000;
	  		var start = parseInt(start / ival)*ival - tzoffset;
	  		var numResults = Math.ceil((end - start) / ival);
	  		var startDate = moment(start);
	  		console.log('startDate', startDate);
	  		startDate.startOf('day');
	  		dates.push(startDate.toDate());
	  		for (var i = 0; i < numResults; i++) {
	  			var nextDate = moment(dates[i]);
	  			nextDate.add(ival, 'ms');
	  			dates.push(nextDate.toDate());
	  		}
	  		return dates;
	  	},
	  	'7d': function (start, end) {
	  		var dates = [];
	  		var ival = 604800000;
	  		var numResults = Math.ceil((end - start) / ival);
	  		//var startDate = new Date(parseInt(start / ival)*ival - tzoffset);
	  		var startDate = moment.utc(parseInt(start / ival)*ival);
	  		startDate.startOf('day');
	  		console.log('startDate', startDate);
	  		dates.push(startDate.toDate());
	  		for (var i = 0; i < numResults; i++) {
	  			var nextDate = moment(dates[i]);
	  			nextDate.add(ival, 'ms');
	  			dates.push(nextDate.toDate());
	  		}
	  		return dates;
	  	},
	  	'1M': function (start, end) {
	  		var dates = [];
	  		var startDate = moment(start);
	  		startDate.startOf('month');
	  		console.log('startDate', startDate);
	  		dates.push(startDate.toDate());
	  		var run = true;
	  		while (run) {
	  			var nextDate = moment(_.last(dates));
	  			nextDate.add(1, 'month');
	  			if (nextDate.valueOf() <= end) {
	  				dates.push(nextDate.toDate());
	  			}else{
	  				run = false;
	  			}
	  		}
	  		return dates;
	  	},
	  	'1y': function (start, end) {
	  		var dates = [];
	  		var startDate = moment(start);
	  		startDate.startOf('year');
	  		console.log('startDate', startDate);
	  		dates.push(startDate.toDate());
	  		var run = true;
	  		while (run) {
	  			var nextDate = moment(_.last(dates));
	  			nextDate.add(1 , 'years');
	  			if (nextDate.valueOf() <= end) {
	  				dates.push(nextDate.toDate());
	  			}else{
	  				run = false;
	  			}
	  		}
	  		return dates;
	  	},
	  	'10y': function (start, end) {
	  		var dates = [];
	  		var startDate = moment(start);
	  		startDate.startOf('year');
	  		console.log('startDate', startDate);
	  		startDate.year(parseInt(startDate.year() / 10)*10);
	  		dates.push(startDate.toDate());
	  		var run = true;
	  		while (run) {
	  			var nextDate = moment(_.last(dates));
	  			nextDate.add(10, 'years');
	  			if (nextDate.valueOf() <= end) {
	  				dates.push(nextDate.toDate());
	  			}else{
	  				run = false;
	  			}
	  		}
	  		return dates;
	  	},
	  	'100y': function (start, end) {
	  		var dates = [];
	  		var startDate = moment(start);
	  		startDate.startOf('year');
	  		console.log('startDate', startDate);
	  		startDate.year(parseInt(startDate.getFullYear() / 100)*100);
	  		dates.push(startDate.toDate());
	  		var run = true;
	  		while (run) {
	  			var nextDate = moment(_.last(dates));
	  			nextDate.add(100, 'years');
	  			if (nextDate.valueOf() <= end) {
	  				dates.push(nextDate.toDate());
	  			}else{
	  				run = false;
	  			}
	  		}
	  		return dates;
	  	},
	  }; 

	  var getNotchMode = function(screenTime) {
	  	var mode;
	  	for (var i=0; i<notchRanges.length; i++) {
	  		if (notchRanges[i] <= screenTime) {
	  			mode = timeNotchModes[notchRanges[i]];
	  		}
	  	}
	  	if (!mode) return timeNotchModes[_.first(notchRanges)];
	  	return mode;
	  };

	  var daysInMonth = function(anyDateInMonth) {
    	return new Date(anyDateInMonth.getYear(), 
                    anyDateInMonth.getMonth()+1, 
                    0).getDate();
   	};

   	var daysInYear = function (d) {
   		var year = d.getFullYear();
	    if(year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
	        // Leap year
	        return 366;
	    } else {
	        // Not a leap year
	        return 365;
	    }
		}

	  var getIntervalWidth = {
	  	'1m': function () {
	  		return 60000 / Bounds.timespan();
	  	},
	  	'5m': function () {
	  		return 300000 / Bounds.timespan();
	  	},
	  	'5m': function () {
	  		return 300000 / Bounds.timespan();
	  	},
	  	'15m': function () {
	  		return 900000 / Bounds.timespan();
	  	},
	  	'1h': function () {
	  		return 3600000 / Bounds.timespan();
	  	},
	  	'6h': function () {
	  		return 21600000 / Bounds.timespan();
	  	},
	  	'1d': function () {
	  		return 86400000 / Bounds.timespan();
	  	},
	  	'7d': function () {
	  		return 604800000 / Bounds.timespan();
	  	},
	  	'1M': function () {
	  		/*
	  		var days = daysInMonth(d);
	  		return ((days*86400000) / Bounds.timespan()) * $scope.bar.width;
	  		*/
	  		return (30.4368499*86400000) / Bounds.timespan();
	  	},
	  	'1y': function () {
	  		//var days = daysInYear(d);
	  		return (365.242199*86400000) / Bounds.timespan();
	  	},
	  	'10y': function () {
	  		return (3652.42199*86400000) / Bounds.timespan();
	  	},
	  	'100y': function () {
	  		return (36520.42199*86400000) / Bounds.timespan();
	  	},
	  }

	  $scope.bar.getTimeNotchStyle = function (date, width) {
	  	var style = {};
	  	var stamp = date.getTime();

	  	// correct the label position for the upper time notch bar (the one with width)
	  	if (width) {
	  		var leftPx = Bounds.project(stamp, $scope.bar.width);
	  		var rightPx = leftPx + (width * $scope.bar.width);
	  		var leftEdgeOnScreen = (leftPx + $scope.bar.left) > 0;
	  		var rightEdgeOnScreen = (rightPx + $scope.bar.left) < window.innerWidth;
	  		var isOnScreen = (leftPx + $scope.bar.left) <= window.innerWidth && (rightPx + $scope.bar.left) >= 0; 

	  		if (!isOnScreen) {
	  			style.display = 'none';
	  		// both ends outside of screen -> center label in the middle
	  		} else if (!leftEdgeOnScreen && !rightEdgeOnScreen) {
	  			style.width = window.innerWidth + 2;
	  			style.left  = -$scope.bar.left - 1;
	  		}else if (!leftEdgeOnScreen && rightEdgeOnScreen){
	  			style.left = ((-$scope.bar.left/$scope.bar.width)*100) + "%";
	  			style.width = (((rightPx + $scope.bar.left)/$scope.bar.width)*100)+'%';
	  		}else if (!rightEdgeOnScreen && leftEdgeOnScreen) {
	  			style.left = Bounds.project(stamp, 100) + "%";
	  			style.width = ((((-$scope.bar.left + window.innerWidth) - leftPx)/$scope.bar.width)*100)+'%'
	  		}else {
	  			style.left = Bounds.project(stamp, 100) + "%";
	  			style.width = (100*width)+'%';
	  		}

	  	}else{
	  		style.left = Bounds.project(stamp, 100) + "%";
	  	}  
	  	return style;
	  };

	  var updateIntervals = function () {

	  	// get interval type from part displayed in screen
	  	var onScreenTime = (window.innerWidth / $scope.bar.width) * Bounds.timespan();
	  	var notchMode = getNotchMode(onScreenTime);
	  	var startTime = Bounds.min + (Bounds.timespan() * (Math.abs($scope.bar.left) / $scope.bar.width ));
	  	var endTime = startTime + onScreenTime;

	  	activeMinInterval = notchMode.bottom.interval;

	  	$scope.bar.timeNotches.first = {
	  		format    : notchMode.top.format,
	  		intervals : intervalFunc[notchMode.top.interval](startTime, endTime),
	  		width     : getIntervalWidth[notchMode.top.interval]()
	  	};

	  	$scope.bar.timeNotches.second = {
	  		format : notchMode.bottom.format,
	  		intervals : intervalFunc[notchMode.bottom.interval](startTime, endTime),
	  	};

	  };

	  /*
	  $scope.bar.getDateoNotchStyle = function (dateo) {
	  	return {
	  		'background-color': dateo.colors[0]
	  	, 'left': Bounds.project(dateo.timestamp) + "%"
	  	};
	  };*/

	  $scope.timeline.zoom = function($ev, factor) {
  		var nuWidth = $scope.bar.width * factor;

  		var outsideScreen = $scope.bar.width - window.innerWidth;
  		var displaceFactor = Math.abs($scope.bar.left) / (outsideScreen > 0 ? outsideScreen : 1);
  		displaceFactor = displaceFactor > 0 ? displaceFactor : 0.5;

  		console.log('displaceFactor', displaceFactor);
  		
  		if (nuWidth < window.innerWidth) {
  			nuWidth = window.innerWidth;
  			$scope.bar.left = 0;
  		}else{
  			var delta = nuWidth - $scope.bar.width;
  			$scope.bar.left -= delta * displaceFactor;
  		}  
	  	$scope.bar.animate = true;
	  	$scope.bar.width = nuWidth;
	  	
	  	setBarStyle();
	  	updateIntervals();
	  	updateClusters();

	  	$timeout(function(){
	  		$scope.bar.animate = false; 
	  		//updateIntervals();
	  		//updateClusters();
	  	},500);
	  };

	  var setBarStyle = function() {
	  	$scope.bar.style.width = $scope.bar.width+'px';
	  	//$scope.bar.style.transform = 'translate3d('+$scope.bar.left+'px, 0, 0)';
	  	$scope.bar.style.left = $scope.bar.left+'px';
	  };

	  $scope.timeline.clusterClick = function ($ev, cluster) {

	  	if (cluster.dateos.length > 1 && activeMinInterval != '5m' && activeMinInterval != '1m') {
	  		
	  		$scope.bar.animate = true;
	  		var stamps = cluster.dateos.map(function (d){ return d.timestamp });
	  		stamps.sort(function (a,b){ return a-b;});
	  		var maxInterval = _.last(stamps) - stamps[0];
	  		var nMode = getNotchMode(maxInterval);
	  		if (nMode.bottom.interval == '1m') {
	  			maxInterval = Bounds.timespan() > 900000 ? 900000 : Bounds.timespan();
	  		}
	  		var zoomFactor = window.innerWidth / ((1.5*maxInterval*$scope.bar.width)/Bounds.timespan());
	  		console.log('maxInterval', maxInterval, 'zoomFactor', zoomFactor, 'nMode', nMode);
	  		$scope.bar.width *= zoomFactor;
	  		$scope.bar.left   = -Bounds.project(stamps[0] - (maxInterval*0.25), $scope.bar.width);

	  		console.log('bar width - left', $scope.bar.width + $scope.bar.left > window.innerWidth);
	  		$scope.timeline.showdateo(cluster.dateos[0]);
	  		$timeout(function () {setSlideHeight(1);});
	  		setBarStyle();
	  		//updateIntervals();

	  		$timeout(function(){
		  		$scope.bar.animate = false; 
		  		updateIntervals();
		  		updateClusters();
		  	},500);
	  	}else{
	  		$scope.timeline.showdateo(cluster.dateos[0]);
	  		updateClusters();
	  	}
	  };

	  $scope.timeline.showdateo = function (dateo) {
	  	var idx = _.findIndex(dateoList, function (d) { return dateo.id === d.id; });
	  	$scope.activeDateos[0] = idx -1 >= 0 ? dateoList[idx-1] : {};
	  	$scope.activeDateos[1] = dateo;
	  	$scope.activeDateos[2] = idx+1 < dateoList.length ? dateoList[idx+1] : {};
	  	$timeout(function () {setSlideHeight(1);});
 	  };

	  $scope.timeline.nextDateo = function () {
	  	if (!$scope.activeDateos[2].id) return;
	  	$scope.slider.slideNext = true;
	  	setSlideHeight(2);

	  	$timeout(function () {
	  		var idx = _.findIndex(dateoList, function (d) { return $scope.activeDateos[2].id === d.id; });
	  		var nuNext = (idx+1) < dateoList.length ? dateoList[idx+1] : {};
	  		var newDateos = $scope.activeDateos.slice(1);
	  		newDateos.push(nuNext);
	  		$scope.activeDateos = newDateos;
	  		$scope.slider.slideNext = false;
	  		updateClusters();

	  		// move bar if active cluster outside of screen
	  		_.each($scope.clusters, function (cluster) {
	  			if (cluster.isActive) {
		  			var leftPercentage = parseFloat(cluster.style.left.replace('%'))/100;
		  			var screenPos = leftPercentage*$scope.bar.width + $scope.bar.left;
		  			if (screenPos >= (window.innerWidth*0.88)) {
		  				$scope.bar.animate = true;
		  				var delta = (Math.abs($scope.bar.left) + window.innerWidth) - (leftPercentage*$scope.bar.width) - (window.innerWidth/4);
		  				if (($scope.bar.left + delta + $scope.bar.width) < window.innerWidth) {
		  					$scope.bar.left = -($scope.bar.width - window.innerWidth);
		  				}else{
		  					$scope.bar.left += delta;
		  				}
		  				setBarStyle();
		  				updateIntervals();
		  				$timeout(function() {$scope.bar.animate = false}, 500);
		  			}
		  			return false;
	  			}
	  		});

	  	}, 420); 
	  };

	  $scope.timeline.prevDateo = function () {
	  	if (!$scope.activeDateos[0].id) return;
	  	$scope.slider.slidePrev = true;
	  	setSlideHeight(0);

	  	$timeout(function () {
	  		var newDateos = $scope.activeDateos.slice(0,2);
	  		var idx = _.findIndex(dateoList, function (d) { return $scope.activeDateos[0].id === d.id; });
	  		newDateos.unshift((idx -1) >= 0 ? dateoList[idx-1] : {});
	  		$scope.activeDateos = newDateos;
	  		$scope.slider.slidePrev = false;
	  		updateClusters();

	  		// move bar if active cluster outside of screen
	  		_.each($scope.clusters, function (cluster) {
	  			if (cluster.isActive) {

		  			var leftPercentage = parseFloat(cluster.style.left.replace('%'))/100;
		  			var screenPos = leftPercentage*$scope.bar.width + $scope.bar.left;
		  			if (screenPos <= (window.innerWidth*0.12)) {
		  				$scope.bar.animate = true;
		  				var delta = Math.abs($scope.bar.left) - (leftPercentage*$scope.bar.width) + (window.innerWidth/4);
		  				if ($scope.bar.left + delta > 0) {
		  					$scope.bar.left = 0;
		  				}else{
		  					$scope.bar.left += delta;
		  				}
		  				setBarStyle();
		  				updateIntervals();
		  				$timeout(function() {$scope.bar.animate = false}, 500);
		  			}
		  			return false;
	  			}
	  		});

	  	}, 420); 
	  };

	  $document.on('keydown', function(e) {
			if (e.which === 39) {
				$scope.$apply($scope.timeline.nextDateo);
			}else if (e.which == 37) {
				$scope.$apply($scope.timeline.prevDateo);
			}
		});

	  var setSlideHeight = function (snum) {
	  	var h = $('.slide-container-'+snum).height();
	  	$scope.slider.wrapStyle = {'height': h+'px'};
	  };

	  var findDateoIndex = function (dateo) {
	  	var idx = _.findIndex(dateoList, function (d) { return dateo.id === d.id; });
	  };

	  var timelineInit = function () {

	  	$scope.bar.dragging = false;
			$scope.bar.left = 0;

			$scope.bar.width = window.innerWidth;
			$scope.bar.style = {left: '0', width: $scope.bar.width+'px'};

	  	dateoList = $scope.dateos();

	  	if (dateoList && !!dateoList.length) {
	  		dateoList.sort(function (a,b) {return a.timestamp - b.timestamp});
	  		$scope.timeline.noResults = false;
		  	Bounds.reset();
		  	
		  	_.each(dateoList, function (dateo) {
		  		Bounds.extend(dateo.timestamp);
		  	});
		  	
		  	var edgeTime = Bounds.timespan() / 5;
		  	Bounds.extend(Bounds.min - edgeTime);
			  Bounds.extend(Bounds.max + edgeTime);
		  	updateIntervals();
		  	if (dateoList.length) $scope.activeDateos = [{}, dateoList[0], dateoList.length > 1 ? dateoList[1]: {}];
		  	updateClusters();
		  }else{
		  	$scope.timeline.noResults = true;
		  }
	  };

	  $scope.$watch('bar.width', function() {
	  	$scope.timeline.zoomOutDisabled = $scope.bar.width == window.innerWidth;
	  });

	  timelineInit();

	  $scope.$on('dateoQuery:done', function () {
	  	timelineInit();
	  });

	  $element.bind("keydown keypress", function (ev) {
	  	console.log(ev);
			if(event.which === 13) {
				event.preventDefault();
			}
		});

	}
} 
} ] );