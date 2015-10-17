'use strict';

angular.module('dateaWebApp')
.controller( 'TagCtrl'
, [ '$scope'
  , 'Api'
  , '$routeParams'
  , '$location'
  , '$q'
  , 'User'
  , '$modal'
  , 'config'
  , '$filter'
  , '$interpolate'
  , 'leafletData'
  , '$timeout'
  , 'leafletMarkersHelpers'
  , '$http'
  , '$compile'
  , 'shareMetaData'
  , 'Datear'
  , '$document'
, function (
    $scope
  , Api
  , $routeParams
  , $location
  , $q
  , User
  , $modal
  , config
  , $filter
  , $interpolate
  , leafletData
  , $timeout
  , leafletMarkersHelpers
  , $http
  , $compile
  , shareMetaData
  , Datear
  , $document
) {

	var sessionMarkersIdx = 0
	  , markersBounds     = []
	  , idxToDateoId
	  , markerIcon
	// fn declarations
	  , isMainTag
	  , isUserFollowing
	  , buildDateos
	  , buildDateosWithImages
	  , buildMarkers
	  , buildMarker
	  , createMarkerPopup 
	  , addMarker
	  , buildTag
	  , buildCampaignsInTag
	  , updateTag
	  , goToMainTag
	  , buildClusterIcon
	  , makeSVGClusterIcon
	  , clusterSizeRange
	  , serializeXmlNode
	  , queryParamsToText
	  , buildSearchParams
	  , paramsToSearch
	  , doSearch
	  , safariMapLayoutFix
	;

	$scope.tag                  = {};
	$scope.tag.selectedMarker   = 'last';
	$scope.flow                 = {};
	$scope.flow.loading 		    = true;
	$scope.flow.leaflet         = {};
	$scope.flow.isUserSignedIn  = User.isSignedIn();
	$scope.flow.dateoDetail     = {
		  dateo : null
		, show  : false 
	};
	$scope.$watch( 'query.limit', function () {
		$scope.flow.limitLabel = { num : ($scope.query.limit < 1000) ? 'máximo '+$scope.query.limit : 'todos los'};
	});
	$scope.flow.orderByOptions = [
			  { val: '-created', label: 'últimos'}
			, { val: '-vote_count', label: 'más apoyados'}
			, { val: '-comment_count', label: 'más comentados'}
	];
	$scope.query                = {
		  limit    : $location.search().limit  || 100
		, order_by : $location.search().order_by || '-created'
		, tab      : $location.search().tab || 'map'
	};
	if ($location.search().since) $scope.query.since = Date.parse($location.search().since) || undefined;
	if ($location.search().until) $scope.query.until = Date.parse($location.search().until) || undefined;
	if ($location.search().q) $scope.query.q = $location.search().q;

	$scope.dateFormat = config.defaultDateFormat;
	$scope.flow.leaflet.events = {enable: ['leafletDirectiveMarker.click']};

	markerIcon = config.visualization.defaultMarkerIcon;
	markerIcon.html = config.visualization.defaultMarkerIcon.htmlGen($location.absUrl());

	isMainTag = function () {
		var dfd = $q.defer();
		Api.campaign
		.getCampaigns( { main_tag: $routeParams.tagName, order_by: '-dateo_count' } )
		.then( function ( response ) {
			dfd.resolve( { isMainTag: !!response.objects.length, tagObj: response.objects } );
		}, function ( error ) {
			dfd.reject( error );
		} );
		return dfd.promise;
	}

	buildTag = function () {
		Api.tag
		.getTags( { tag: $routeParams.tagName } )
		.then( function ( response ) {
			var shareData;
			if ( response.objects.length ) {
				angular.extend($scope.tag, response.objects[0]);
				//buildDateos();
				//buildDateosWithImages();
				doSearch();

				shareData = {
					  title       : 'Datea | dateos en #'+$scope.tag.tag
					, description : "Chequea los dateos con el hashtag #"+$scope.tag.tag+" en Datea." 
				}
				shareMetaData.setData(shareData);
				$scope.flow.shareableUrl = config.app.url+'/tag/'+$scope.tag.tag;

			} else {
				$location.path('/404').replace();
			}
		}, function ( reason ) {
			console.log( reason );
			if ( reason.status === 404 ) {
				$location.path('/404').replace();
			}
		} );
	}

	updateTag = function () {
		Api.tag
		.getTags( { tag: $routeParams.tagName } )
		.then( function ( response ) {
			angular.extend($scope.tag, response.objects[0]);
		}, function (reason) {
			console.log(reason);
		});
	}

	buildSearchParams = function () {
		var query = {tags: $routeParams.tagName};
		for (var p in $location.search()) {
			if (p !== 'tab') {
				query[p] = $location.search()[p];
			}
		}
		return query;
	}

	queryParamsToText = function (numResults) {
		var text    = []
			, q       = $scope.query
			, showing
		;

		if (numResults !== undefined) {
			showing = numResults > q.limit ? q.limit : numResults;
		}else{
			showing = q.limit;
		}

		// order by
		if (showing > 0) {
			if (q.order_by === '-created') text.push('últimos '+showing);
			if (q.order_by === '-vote_count') text.push(showing+' más apoyados');
			if (q.order_by === '-comment_count') text.push(showing+' más comentados');
		}else{
			text.push('sin resultados');
		}
		// date
		if (q.since && q.until) {
			text.push($filter('date')(q.since, 'd/M/yy') + ' > '+ $filter('date')(q.until, 'd/M/yy'));
		}else{
			if (q.since) text.push('desde &nbsp;'+$filter('date')(q.since, 'd/M/yy'));
			if (q.until) text.push('hasta &nbsp;'+$filter('date')(q.until, 'd/M/yy'));
		}

		$scope.flow.queryTextRep = text;
	}

	paramsToSearch = function () {
		var params = {}
		for (var p in $scope.query) {
			if ($scope.query[p]) {
				if (p === 'since' || p === 'until') {
					params[p] = $scope.query[p].toISOString();
				}else{
					params[p] = $scope.query[p]; 
				}
			}
		}
		$location.search(params);
	}

	doSearch = function ( givens ) {
		var tab = $location.search().tab || 'map'
			, params;

		$scope.flow.showFilter = false;
		$scope.flow.loading = true;

		params = buildSearchParams();

		if (tab === 'map') {
			$scope.tag.dateos = [];
			$scope.flow.leaflet.markers = {};
		}else if (tab === 'images') {
			$scope.tag.dateosWithImages = [];
			params.has_images = 1;
		}
		Api.dateo
		.getDateos( params )
		.then( function ( response ) {
			var geodateos = [];
			if (tab === 'map') {
				safariMapLayoutFix();
				$scope.flow.dateoShowListNumResults = config.defaultdateoNumResults;
				$scope.tag.dateos = response.objects;
				idxToDateoId = response.objects.map(function (d) {return d.id});
				buildMarkers( { dateos: response.objects } );
			
			}else if (tab === 'images') {
				var images = [];
				_.each(response.objects, function (dateo) {
					_.each(dateo.images, function (img) {
						img.dateo = dateo;
						images.push(img);
					})
				});
				$scope.tag.dateoImages = images;
			}
			queryParamsToText(response.objects.length);
			$scope.flow.loading = false;
		}, function ( reason ) {
			console.log( reason );
		} );
	};

	$scope.flow.doSearch = function () {
		paramsToSearch();
		doSearch();
	};

	$scope.flow.showMoreListResults = function (ev) {
		$scope.flow.dateoShowListNumResults += config.defaultdateoNumResults;
	};

	$scope.flow.openTab = function(tab) {
		$location.search('tab', tab);
		$scope.query.tab = tab;
		$scope.flow.doSearch();
	};

	$scope.flow.share = function () {
		var img = config.app.url + '/static/images/logo-large.png';
		$modal.open( { templateUrl : 'views/share.html'
		             , controller  : 'ShareCtrl'
		             , resolve     : {
		                shareModalGivens : function () {
		                  return { url         : $scope.flow.shareableUrl
		                         , title       : 'Datea | dateos en #'+$scope.tag.tag
		                         , description : "Chequea los dateos con el hashtag #"+$scope.tag.tag+" en Datea." 
		                         , image       : img}
		                 }
		             } } );
	}

	buildMarkers = function ( givens ) {
		var dateos  = givens && givens.dateos
		  , markers = {}
		  , center  = {}
		  ;
		// Cleaning
		sessionMarkersIdx = 0;
		$scope.flow.leaflet.markers = {};

		angular.forEach( dateos, function ( value, key ) {
			// default image for markers
			if (!!value.position) {
				addMarker(value);
				markersBounds.push( [ value.position.coordinates[1], value.position.coordinates[0] ] );
			}
		} );
		//center.lat  = markers.marker0.lat;
		//center.lng  = markers.marker0.lng;
		//center.zoom = config.campaign.mapZoomFocus;
		//angular.extend( $scope.flow.leaflet.markers, markers );
		//angular.extend( $scope.flow.leaflet.center, center );
		if (dateos.length) {
			leafletData.getMap("leafletTag")
			.then( function ( map ) {
				map.fitBounds( markersBounds );
			} );
		}
	}

	buildMarker = function(dateo) {
			return {
			  lat       : dateo.position.coordinates[1]
			, lng       : dateo.position.coordinates[0]
			, group     : $scope.tag.tag
			, label     : { message: '#'+$scope.tag.tag }
			//, message     : $interpolate( config.marker )(dateo)
			, draggable   : false
			, focus       : false
			, _id         : dateo.id
			, icon 			  : markerIcon
			, riseOnHover : true
			};
	}

	addMarker = function (dateo) {
		var marker = buildMarker(dateo);
		$scope.flow.leaflet.markers['marker'+dateo.id] = marker;
		sessionMarkersIdx ++; 
	}

	createMarkerPopup = function (marker) {
		$http.get('views/dateo-map-popup.html')
 		.success(function(html) {
 			var compiled, pscope, pelem, idx, latLng;
 			idx = idxToDateoId.indexOf(marker.options._id);
 			pscope = $scope.$new(true);
 			pscope.dateo = $scope.tag.dateos[idx];
 			pscope.dateFormat = config.defaultDateFormat;
 			pscope.openDetail = function () {
 				$scope.flow.openDateoDetail(pscope.dateo.id);
 			}
 			pscope.tags = pscope.dateo.tags.slice(0, 2);
 			compiled = $compile(angular.element(html));
 			pelem = compiled(pscope);

 			latLng = marker.getLatLng();

 			leafletData.getMap("leafletTag")
			.then( function ( map ) {
				L.popup({
					offset: L.point(0, -32)
				})
				.setLatLng(latLng)
				.setContent(pelem[0])
				.openOn(map);
			});
 		});
	}

	$scope.clusterOptions = { 
		//iconCreateFunction: $scope.buildClusterIcon,
		//disableClusteringAtZoom: 17,
		polygonOptions: {
			weight: 1,
			fillColor: "#999",
			color: '#999',
			fillOpacity: 0.4
		}
	};

	goToMainTag = function ( givens ) {
		$location.path( givens.username + '/' + givens.tagName ).replace();
	}

	$scope.tag.isUserFollowing = function () {
		return isUserFollowing();
	}

	Datear.setContext({ defaultTag : $routeParams.tagName });

	$scope.$on('user:hasDateado', function (event, args){
		if (args.created) {
			$scope.tag.dateos.unshift(args.dateo);
			idxToDateoId.unshift(args.dateo.id);
   		if (args.dateo.is_geolocated) addMarker(args.dateo);
   		if (args.dateo.has_images) $scope.tag.dateosWithImages.unshift(args.dateo);
   		updateTag();
   		if (!!args.dateo.position) $scope.flow.focusDateo(args.dateo.id); 
		}
	});

	$scope.$on('user:dateoDelete', function (event, args) {
		$scope.flow.closeDateoDetail();
		$scope.flow.doSearch();
		updateTag();
	});

	$scope.flow.focusDateo = function ( id ) {
		var markerName;
		markerName  = "marker"+id;

		leafletData.getMarkers('leafletTag')
		.then(function (markers) {
			var cluster = leafletMarkersHelpers.getCurrentGroups()[$scope.tag.tag];
			var marker = markers[markerName];
			if (cluster && marker) {
				cluster.zoomToShowLayer(marker, function () {
					$scope.flow.leaflet.markers[markerName].focus;
					createMarkerPopup(marker);
				});
			} 
		});
	}

	$scope.flow.openDateoDetail = function (id) {
		var index = idxToDateoId.indexOf(id)
			, dateo = $scope.tag.dateos[index]
			;
		$scope.flow.dateoDetail.dateo       = dateo;
		$scope.flow.dateoDetail.markerIndex = index;
		$scope.flow.dateoDetail.show        = true;
		if (!!dateo.position) $scope.flow.focusDateo(id);
	}

	$scope.flow.closeDateoDetail = function (index) {
		$scope.flow.dateoDetail.dateo = null;
		$scope.flow.dateoDetail.show  = false;
	}

	$scope.$on('focus-dateo', function (event, args) {
		$scope.flow.focusDateo(args.id);
	} );

	$scope.$on('open-dateo-detail', function (event, args) {
		$scope.flow.openDateoDetail(args.id);
	} );

	$scope.$on('close-dateo-detail', function () {
		$scope.flow.closeDateoDetail();
	} );

	$scope.$on('leafletDirectiveMarker.click', function(event, args) {
		$scope.flow.leaflet.markers[args.markerName].focus = true;
		createMarkerPopup(args.leafletEvent.target);
	});

	$scope.tag.searchDateos = function () {
		if ( $scope.tag.searchDateosKeyword ) {
			buildDateos( { q: $scope.tag.searchDateosKeyword } );
		} else {
			buildDateos();
		}
		$scope.flow.loading = false;
	}

	$scope.flow.scrollToCampaigns = function (event) {
		event.preventDefault();
		event.stopPropagation();
		$document.scrollToElement($('#campaigns'), 100, 400);
	}

	clusterSizeRange = d3.scale.linear()
		.domain([0, 100])
		.range([50, 80])
		.clamp(true);

	buildClusterIcon = function (cluster) {
		var children = cluster.getAllChildMarkers()
		  , n        = children.length
		  , d        = clusterSizeRange(children.length)
		  , di       = d + 1
		  , r        = d / 2
			, html
			, clusterIcon
		;

		html = makeSVGClusterIcon({
				  n: n
				, r: r
				, d: d
			});

		clusterIcon = new L.DivIcon({
			  html: html
			, className: 'marker-cluster'
			, iconSize: new L.Point(di,di)
		});

		return clusterIcon;
	}

	makeSVGClusterIcon = function (opt) {
		var svg, vis, arc, pie, arcs;
		svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
		vis = d3.select(svg).data([opt.data])
			.attr( 'class', 'datea-svg-cluster' )
			.attr("width", opt.d)
			.attr("height", opt.d)
			.append("svg:g")
			.attr("transform", "translate(" + opt.r + "," + opt.r + ")");

		vis.append('circle')
			.attr("fill", config.visualization.default_color)
			.attr("r", opt.r)
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("opacity", 0.75);

		vis.append("circle")
			.attr("fill", "#ffffff")
			.attr("r", opt.r / 2.2)
			.attr("cx", 0)
			.attr("cy", 0);

		vis.append("text")
			.attr("x", 0)
			.attr("y", 0)
			.attr("class", "cpie-label")
			.attr("text-anchor", "middle")
			.attr("dy", '.3em')
			.text(opt.n);

		return serializeXmlNode(svg);
	}

	$scope.flow.leaflet.clusterOptions = { 
		  iconCreateFunction : buildClusterIcon
		//, disableClusteringAtZoom: 17
		, polygonOptions     : {
			  weight      : 1
			, fillColor   : "#999"
			, color       : '#999'
			, fillOpacity : 0.4
		}
	};

	serializeXmlNode = function (xmlNode) {
		if (typeof window.XMLSerializer != "undefined") {
    	return (new window.XMLSerializer()).serializeToString(xmlNode);
		} else if (typeof xmlNode.xml != "undefined") {
    	return xmlNode.xml;
		}
    return "";
  }

	if ( $routeParams.tagName ) {
		isMainTag().then( function ( givens ) {
			/* if ( givens.isMainTag && givens.tagObj.length === 1) {
				goToMainTag( { username: givens.tagObj[0].user.username
				             , tagName : givens.tagObj[0].main_tag.tag
				             } );
			} else { */
				if (givens.tagObj.length > 0) {
					$scope.campaignsInTag = givens.tagObj;
				}
				buildTag();
			// }
		}, function ( reason ) {
			console.log( reason );
		} );
		angular.extend( $scope.flow.leaflet, config.defaultMap );
	}

	$(window).resize(function (){
		safariMapLayoutFix();
	});

	safariMapLayoutFix = function () {
		if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) {
			var $mh = $('.dateo-map-viz');
			var h = $mh.height();
	  	$('.leaflet-map-holder, .dateos-holder').css('height', h+'px');
	  	leafletData.getMap("leafletTag")
			.then( function ( map ) {
				map.invalidateSize();
			});
		};
	}

	$scope.$on('$destroy', function () {
		markersBounds   = [];
		$scope.tag = {};
		leafletMarkersHelpers.resetCurrentGroups();
		Datear.resetContext();
		$(window).off('resize');
	});

} ] );
