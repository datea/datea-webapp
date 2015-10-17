'use strict';

angular.module('dateaWebApp')
.controller( 'CampaignCtrl'
, [ '$scope'
  , 'Api'
  , '$routeParams'
  , 'config'
  , '$interpolate'
  , '$compile'
  , 'leafletData'
  , '$timeout'
  , '$filter'
  , 'User'
  , '$window'
  , '$modal'
  , '$location'
  , 'leafletMarkersHelpers'
  , '$http'
  , '$document'
  , 'geoJSONStyle'
  , 'Piecluster'
  , '$rootScope'
  , 'localStorageService'
  , 'shareMetaData'
  , 'Datear'
  , '$translate'
, function (
    $scope
  , Api
  , $routeParams
  , config
  , $interpolate
  , $compile
  , leafletData
  , $timeout
  , $filter
  , User
  , $window
  , $modal
  , $location
  , leafletMarkersHelpers
  , $http
  , $document
  , geoJSONStyle
  , Piecluster
  , $rootScope
  , localStorageService
  , shareMetaData
  , Datear
  , $translate
) {

	var sessionMarkersIdx = 0
	  , ls                = localStorageService
	  , markersBounds     = []
	  , defaultMap
	  , idxToDateoId      = []
	  , modalInstance
	  , queryCache        = {}
	  , cardHeight
	  , nextURL
	  // fn declarations
	  , buildCampaign
	  , updateCampaign
	  , buildDateos
	  , buildDateosWithImages
	  , buildMarkers
	  , buildMarker
	  , addMarker
	  , buildFollowersList
	  , buildRelatedCampaigns
	  , buildLayerFiles
	  , checkDateoDisplayOptions
	  , checkTimeLeft
	  , createMarkerPopup
	  , getTagsString
	  , sessionMarkersIdx = 0
	  , serializeXmlNode
	  , buildMarkerIcon
	  , setChartForPie
	  , setChartForBar
	  , buildClusterIcon
	  , clusterSizeRange 
	  , makeSVGPie 
	  , initQueryOptions
	  , buildQueryParams
	  , queryParamsToText
	  , renderPopupContent
	  , safariMapLayoutFix
	  , initSearchParams
	  , paramsToSearch
	  , queryDateos
	  , queryDateosFunc
	;

	$scope.campaign          = {};
	$scope.campaign.leaflet  = {};
	$scope.campaign.dateos   = {};
	$scope.dateFormat        = config.defaultDateFormat;
	$scope.flow              = {};
	$scope.flow.notFound     = false;
	$scope.flow.userIsOwner  = false;
	$scope.flow.activeTab    = $location.search()['tab'] || 'map';
	$scope.flow.loading      = true;
	$scope.flow.mapIsPresent = true;
	$scope.flow.colorRange   =  d3.scale.category10().range();
	$scope.flow.hasLegend    = false;
	$scope.flow.showLegendExpandLink = false;
	$scope.flow.showLegendContractLink = false;
	$scope.flow.dateoShowListNumResults = config.defaultdateoNumResults;
	$scope.campaign.isUserSignedIn = User.isSignedIn();
	$scope.dateamap          = {};
	$scope.chart             = {type: 'pie', typeControl: 'pie'};
	$scope.flow.dateoDetail  = {
		  dateo : null
		, show  : false 
	};
	$scope.query             = {};
	$scope.campaign.leaflet.events = {enable: ['leafletDirectiveMarker.click']};

	buildRelatedCampaigns = function () {
		var tags = getTagsString( $scope.campaign );
		Api.campaign
		.getCampaigns( {tags : tags} )
		.then( function ( response ) {
			$scope.campaign.relatedCampaigns = response.objects[0];
		}, function ( reason ) {
			console.log( reason );
		});
	}

	buildMarkers = function ( givens ) {
		var dateos  = givens && givens.dateos
		  , markers = {}
		  , center  = {}
		  ;
		// Cleaning
		sessionMarkersIdx = 0;
		$scope.campaign.leaflet.markers = {};

		angular.forEach( dateos, function ( value, index ) {
			if (!!value.position) {			
				addMarker(value);
				//markersBounds.push( [ value.position.coordinates[1], value.position.coordinates[0] ] );
				markersBounds.push(L.latLng(value.position.coordinates[1], value.position.coordinates[0]));
			}else{
				sessionMarkersIdx ++;
			}
		} );
		//center.lat  = markers.marker0.lat;
		//center.lng  = markers.marker0.lng;
		//center.zoom = config.campaign.mapZoomFocus;
		//angular.extend( $scope.campaign.leaflet.markers, markers );
		//angular.extend( $scope.campaign.leaflet.center, center );
		if (dateos.length) {
			leafletData.getMap("leafletCampaign")
			.then( function ( map ) {
				var bounds = L.latLngBounds(markersBounds);
				map.fitBounds( bounds );
			} );
		}
		// $scope.campaign.leaflet.markers.marker0.focus = true;
	}

	buildMarker = function(dateo) {
		
			var tags = [];
			var labelTags = []; 
			angular.forEach(dateo.tags, function (tag) { 
				if (angular.isDefined($scope.subTags[tag])) labelTags.push('#'+tag);
				tags.push(tag);
			});
			
			return {
			  lat         : dateo.position.coordinates[1]
			, lng         : dateo.position.coordinates[0]
			, group       : $scope.campaign.main_tag.tag
			, label       : { message: labelTags.join(',') }
			//, message     : $interpolate( config.marker )(dateo)
			, draggable   : false
			, focus       : false
			, _id         : dateo.id
			, tags        : tags
			, icon 			  : buildMarkerIcon(dateo)
			, riseOnHover : true
			};
	}

	var buildMarkerIcon = function(dateo) {
		var colors = [] 
		  , html
		  , catWidth
		  , clipPath
		;
		catWidth = (config.visualization.markerWidth / dateo.colors.length)

		clipPath = $location.absUrl() + '#pinpath';
		
		html = '<svg width="'+config.visualization.markerWidth+'" height="'+config.visualization.markerHeight+'"><g style="clip-path: url('+clipPath+');">';
		_.each(dateo.colors, function (color, i) {
			html = html + '<rect height="'+config.visualization.markerHeight+'" width="'+parseInt(Math.ceil(catWidth))+'" fill="'+color+'" x="'+parseInt(Math.ceil(i*catWidth))+'" />';
		});
		html = html 
				 + '<circle cx="14.5" cy="13" r="4" fill="white" />'
				 + '<path d="'+config.visualization.markerSvgPath+'" stroke="#888888" fill="none" stroke-width="1" />'															 		 				
				 + '</g></svg>';

		return {
			  type        : 'div'
			, iconSize    : [29, 40]
			, iconAnchor  : [14.5, 40]
			, popupAnchor : [0, -33]
			, labelAnchor : [8, -25]
			, html        : html
			, className   : 'datea-pin-icon'
		}
	}

	addMarker = function (dateo) {
		var marker;
		marker = buildMarker(dateo);
		$scope.campaign.leaflet.markers["marker"+dateo.id] = marker;
		sessionMarkersIdx ++; 
	}

	createMarkerPopup = function (marker) {
		$http.get('views/dateo-map-popup.html')
 		.success(function(html) {
 			var compiled, pscope, pelem, idx, latLng;
 			idx = idxToDateoId.indexOf(marker.options._id);
 			pscope = $scope.$new(true);
 			pscope.dateo = $scope.campaign.dateos[idx];
 			pscope.dateFormat = config.defaultDateFormat;
 			pscope.openDetail = function () {
 				$scope.flow.openDateoDetail(pscope.dateo.id);
 			}
 			pscope.tags = pscope.dateo.tags.slice(0, 2);
 			compiled = $compile(angular.element(html));
 			pelem = compiled(pscope);

 			latLng = marker.getLatLng();
 			//if (!latLng) {
 			//	latLng = L.latLng(pscope.dateo.position.coordinates[1], pscope.dateo.position.coordinates[0]);
 			//}

 			leafletData.getMap("leafletCampaign")
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

	buildFollowersList = function () {
		$scope.campaign.followers = [];
		Api.user
		.getUsers( { follow_key: 'tag.'+$scope.campaign.main_tag.id } )
		.then( function ( response ) {
			angular.extend( $scope.campaign.followers, response.objects );
		}, function ( reason ) {
			console.log( reason );
		} );
	}

	buildCampaign = function () {
		var campaignGivens = {}
			, shareData      = {};
		campaignGivens.user = $routeParams.username;
		campaignGivens.slug = $routeParams.campaignName;
		if (User.isSignedIn() && $routeParams.username === User.data.username) {
			campaignGivens.published = 'all';
		}

		Api.campaign
		.getCampaigns( campaignGivens )
		.then( function ( response ) {
			if ( response.objects[0] ) {
				angular.extend( $scope.campaign, response.objects[0] );
				if ($scope.campaign.secondary_tags && $scope.campaign.secondary_tags.length > 10) {
					$scope.flow.colorRange = d3.scale.category20().range();
				}

				// SEO AND SOCIAL TAGS
				shareData = {
					  title       : '#'+$scope.campaign.main_tag.tag+', '+$scope.campaign.name+' | Datea'
					, description : $scope.campaign.short_description
					, imageUrl    : $scope.campaign.image ? $scope.campaign.image.image : config.defaultImgCampaignLarge 
				}
				shareMetaData.setData(shareData);
				$scope.flow.shareableUrl = config.app.url+'/'+$scope.campaign.user.username+'/'+$scope.campaign.slug;

				// build everything
				buildSubTags();
				initQueryOptions();
				initSearchParams();
				$scope.flow.getDateos();
				buildFollowersList();
				buildRelatedCampaigns();
				buildLayerFiles();
				checkTimeLeft();
				if ($scope.flow.activeTab == 'stats') $scope.chart.buildCharts();
				
				if (User.isSignedIn() && User.data.id == $scope.campaign.user.id) {
					$scope.flow.userIsOwner = true;
				}

				// SET DATEAR CONTEXT
				Datear.setContext({ defaultTag    : $scope.campaign.main_tag.tag
                  , suggestedTags : $scope.campaign.secondary_tags
                  , campaignId    : $scope.campaign.id
     						  , boundary      : $scope.campaign.boundary || null
     						  , layerFiles    : $scope.campaign.layer_files
                  });

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

	checkTimeLeft = function () {
		var endDate, ts, now;
		if ($scope.campaign.end_date) {
			endDate = moment($scope.campaign.end_date);
			now = moment();
			ts = endDate.diff(now, 'days');
			if (ts.days < 0) {
				$translate('CAMPAIGN.EXPIRED').then(function (msg) {
					$scope.flow.endDate = {type: 'warning', msg: msg};
				});
			}else if (ts.days === 0) {
				$translate('CAMPAIGN.LAST_DAY').then(function (msg) {
					$scope.flow.endDate = {type: 'warning', msg: msg};
				});
			}else {
				$translate('CAMPAIGN.DAYS_LEFT', {days : ts.days}).then(function (msg) {
					$scope.flow.endDate = {type: 'normal', msg: msg};
				});
			}
		}
	}

	updateCampaign = function () {
		var campaignGivens = {
			  user: $routeParams.username
			, main_tag: $routeParams.campaignName
		}
		Api.campaign
		.getCampaigns(campaignGivens)
		.then( function (response) {
			angular.extend( $scope.campaign, response.objects[0] );
		}, function (reason) {
			console.log(reason);	
		} );
	}

	getTagsString = function ( givens ) {
		var mainTag       = givens.main_tag
		  , secondaryTags = givens.secondary_tags
		  , secondaryTagsArray = []
		  ;
		angular.forEach( secondaryTags, function ( value, key ) {
			!!value.tag && secondaryTagsArray.push( value.tag );
		});
		return !secondaryTags.length ? mainTag.tag : mainTag.tag + ',' + secondaryTagsArray.join(',');
	}

	/* QUERY PARAMS INIT */
	$scope.query = {
		  tag              : ''
		, limit            : 100
		, order_by          : '-created'
	};
	$scope.flow.tagFilterOptions = [];
	$scope.flow.orderByOptions  = [
		  { val: '-created', label: 'últimos'}
		, { val: '-vote_count', label: 'más apoyados'}
		, { val: '-comment_count', label: 'más comentados'}
	];
	$scope.flow.queryDone = false;

	$scope.$watch( 'query.limit', function () {
		$scope.flow.queryLimitLabel = {
			num : ($scope.query.limit < 1000) ? 'máximo '+$scope.query.limit : 'todos los'
		};
	});

	initQueryOptions = function () {
		if ($scope.campaign.secondary_tags) {
			$scope.flow.tagFilterOptions.push({value: '', label: '-- todas -- '});
			angular.forEach($scope.campaign.secondary_tags, function (tag) {
				$scope.flow.tagFilterOptions.push({value: tag.tag, label: '#'+tag.tag});
			} );
		}
		if ($scope.campaign.default_filter === 'owner') {
			$scope.query.owner = true;
		}
	}

	checkDateoDisplayOptions = function () {
		if ($scope.query.owner) {
			$scope.flow.showRedateoAuthor = $scope.campaign.user.username;
		}else{
			$scope.flow.showRedateoAuthor = null;
		}
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

	buildQueryParams = function () {
		var tags = [$scope.campaign.main_tag.tag]
			, params = {}
			, locSearch = $location.search()
		;
		for (var p in locSearch) {
			if (p !== 'tab') {
				if (p === 'tag' && locSearch.tag) {
					tags.push(locSearch.tag);
				} else if ( p === 'owner'){
					params.user_id = $scope.campaign.user.id;
					params.with_redateos = true;
				}else {
					params[p] = locSearch[p]; 
				}
			}
		}
		params.tags = tags.join(',');
		if (tags.length > 0) params.tag_operator = 'and';
		if (!params.limit) params.limit = $scope.query.limit;

		queryParamsToText();
		return params;
	}

	initSearchParams = function () {
		var locSearch = $location.search();
		for (var p in locSearch) {
			if (p !== 'tab') {
				$scope.query[p] = locSearch[p];
			}
		}
	}

	queryParamsToText = function (numResults) {
		var text = []
			, q    = $scope.query
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
			text.push('sin resultados')
		}
		// tag
		if (q.tag) text.push('en #'+q.tag);
		// owner
		if (q.owner) text.push('por '+$scope.campaign.user.username);
		// date
		if (q.since && q.until) {
			text.push($filter('date')(q.since, 'd/M/yy') + ' > '+ $filter('date')(q.until, 'd/M/yy'));
		}else{
			if (q.since) text.push('desde &nbsp;'+$filter('date')(q.since, 'd/M/yy'));
			if (q.until) text.push('hasta &nbsp;'+$filter('date')(q.until, 'd/M/yy'));
		}

		$scope.flow.queryTextRep = text;
	}

	$scope.flow.getDateos = function () {
		if ( !$scope.campaign.id ) return;

		var givens    = buildQueryParams()
			, activeTab = $scope.flow.activeTab
			, geodateos    = []
			, paramStr
		; 

		if (activeTab === 'images') givens.has_images = 1;

		paramStr = JSON.stringify(givens);
		if (queryCache[activeTab] && queryCache[activeTab] === paramStr) return;
		queryCache[activeTab] = paramStr; 
		
		$scope.flow.loading = true;
		$scope.flow.queryDone   = false;

		checkDateoDisplayOptions();
		queryDateos(givens);
	}

	queryDateos = function (givens) {

		var totalInApi = 0
			, times      = Math.ceil(givens.limit / config.dateosLoadedAtOnce)
			, offset     = 0
			, timesDone  = 0
			, dateos     = []
			, dateoIds    = []
			, activeTab = $scope.flow.activeTab
		;

		switch (activeTab) {
			case 'map':
				$scope.campaign.dateos           = [];
				$scope.campaign.leaflet.markers  = {};
				break;
			case 'images':
				$scope.campaign.dateosWithImages = [];
				break;
			case 'timeline': 
				$scope.campaign.dateos = [];
				break;
		}
	
		givens.offset = 0;

		var queryDateosFunc = function (givens) {
			Api.dateo
			.getDateos( givens )
			.then( function ( response ) {
					dateos = dateos.concat(response.objects.map(function (d) {
						d.timestamp = moment(d.date || d.created).valueOf();
						d.colors = [];
						_.each(d.tags, function(tag){
							if (tag != $scope.campaign.main_tag.tag && !!$scope.subTags[tag]) {
								d.colors.push($scope.subTags[tag].color);
							}
						});
						if (d.colors.length == 0) d.colors.push(config.visualization.default_color);
						return d;
					}));
					dateoIds = dateoIds.concat(response.objects.map(function(d) {return d.id;}));
					timesDone++;
					/* are we done? */
					if (timesDone >= times || response.meta.total_count === dateos.length) {
						switch(activeTab) {
							case 'map': 
								idxToDateoId = dateoIds;
								$scope.campaign.dateos = dateos;
								buildMarkers( { dateos : dateos } );
								safariMapLayoutFix();
								break;
							case 'images':
								var images = [];
								_.each(response.objects, function (dateo) {
									_.each(dateo.images, function (img) {
										img.dateo = dateo;
										images.push(img);
									})
								});
								$scope.campaign.dateoImages = images;
								break;
							case 'timeline':
								$scope.campaign.dateos = dateos;
								break;
						}
						$scope.flow.loading = false;
						$scope.flow.queryDone   = true;
						$scope.flow.dateoShowListNumResults = config.defaultdateoNumResults;
						queryParamsToText(dateos.length);
						$rootScope.$broadcast('dateoQuery:done');
					
					/* reciprocate further */
					}else{
						givens.offset += config.dateosLoadedAtOnce;
						queryDateosFunc(givens);
					}
			}, function (reason) {
				console.log('reason');
			});
		}
		queryDateosFunc(givens);
	}

	$scope.$watch( 'flow.activeTab', function () {
		$scope.flow.getDateos();
		$location.search('tab', $scope.flow.activeTab);
		if ($scope.flow.activeTab == 'stats' && $scope.campaign.id) $scope.chart.buildCharts();
	});

	$scope.flow.getSearch = function (ev) {
		ev.preventDefault();
		$scope.flow.showFilter = false;
		paramsToSearch();
		$scope.flow.getDateos();
	};

	$scope.flow.showMoreListResults = function (ev) {
		$scope.flow.dateoShowListNumResults += config.defaultdateoNumResults;
	};

	var buildSubTags = function () {
		var subTags = {};
		if ($scope.campaign.secondary_tags.length > 0) $scope.flow.hasLegend = true;
		angular.forEach($scope.campaign.secondary_tags, function (tag, key) {
			subTags[tag.tag] = {obj: tag, color: $scope.flow.colorRange[key%20]}
		});
		$scope.subTags = subTags;
	};

	$scope.chart.buildCharts = function () {
		console.log('buildCharts');
		Api.stats.getStats({campaign: $scope.campaign.id})
		.then( function ( response ) {
			$scope.chart.rawData = response;
			console.log('chart raw data', $scope.chart.rawData);

			if ($scope.chart.type == 'pie') {
				setChartForPie();
			} else if ($scope.chart.type == 'bar') {
				setChartForBar();
			}
			$timeout(function () {$scope.chart.visible = true;}, 10);
		}, function ( error ) {
			console.log( error );
		} );
	};

	$scope.chart.changeChartType = function (arg) {
		if ($scope.chart.typeControl == 'pie') {
			setChartForPie();
		}else if ($scope.chart.typeControl == 'bar') {
			setChartForBar();
		}
		$scope.chart.type = $scope.chart.typeControl;
	};

	setChartForPie = function () {
		
		$scope.chart.data = {
			  series : []
			, data   : []
		};

		$scope.chart.config = {
    		  title    : 'Estadísticas'
    		, tooltips : true
    		, labels   : true
    		, legend   : {
      			  display  : true
      			, position : 'right'
    		}
    		, innerRadius : 0
    		, colors      : []
	  	};

	  	_.each($scope.chart.rawData.tags, function (val) {
			$scope.chart.data.data.push({
				  x: '#'+val.tag
				, y: [val.count]
				//tooltip: $scope.subTags[val.tag].title
			});
			$scope.chart.data.series.push('#'+val.tag);
			//$scope.statsVisible = true;
			$scope.chart.config.colors.push($scope.subTags[val.tag].color);
		});
		console.log('scope.chart', $scope.chart);
	};

	setChartForBar = function () {
		
		$scope.chart.data = {
			  series : []
			, data   : [{x: 'por etiquetas', y: []}]
		};

		$scope.chart.config = {
    		  title    : 'Estadísticas'
    		, tooltips : true
    		, labels   : false
    		, legend   : {
      			  display  : true
      			, position : 'right'
      		}
      		, colors : []
	  	};

	  	_.each($scope.chart.rawData.tags, function (val) {
				$scope.chart.data.data[0].y.push(val.count);
				$scope.chart.data.series.push('#'+val.tag);
				//$scope.statsVsisible = true;
				$scope.chart.config.colors.push('#'+$scope.subTags[val.tag].color);
		});
	};

	$scope.dateamap.focusDateo = function ( id ) {
		var markerName;
		markerName  = "marker"+id;

		leafletData.getMarkers('leafletCampaign')
		.then(function (markers) {
			var cluster = leafletMarkersHelpers.getCurrentGroups()[$scope.campaign.main_tag.tag];
			var marker = markers[markerName];
			if (cluster && marker) {
				cluster.zoomToShowLayer(marker, function () {
					$scope.campaign.leaflet.markers[markerName].focus;
					createMarkerPopup(marker);
				});
			} 
		});
	};

	$scope.flow.openDateoDetail = function (id) {
		var index = idxToDateoId.indexOf(id)
			, dateo = $scope.campaign.dateos[index];
		$scope.flow.dateoDetail.dateo  = dateo;
		//$scope.flow.dateoDetail.markerIndex = index;
		$scope.flow.dateoDetail.show   = true;
		if (!!dateo.position) $scope.dateamap.focusDateo(id);
	};
	$scope.flow.closeDateoDetail = function (index) {
		$scope.flow.dateoDetail.dateo = null;
		$scope.flow.dateoDetail.show  = false;
	};

	$scope.$on('focus-dateo', function (event, args) {
		$scope.dateamap.focusDateo(args.id);
	} );
	$scope.$on('open-dateo-detail', function (event, args) {
		$scope.flow.openDateoDetail(args.id);
	} );
	$scope.$on('close-dateo-detail', function () {
		$scope.flow.closeDateoDetail();
	} );
  $scope.$on('leafletDirectiveMarker.click', function(event, args) {
  	$scope.campaign.leaflet.markers[args.markerName].focus;
		createMarkerPopup(args.leafletEvent.target);
	});

	$scope.campaign.onSelectFilterChange = function () {
		buildDateos();
	};

	$scope.campaign.print = function () {
		$window.print();
	};

	$scope.$on('user:hasDateado', function (event, args){
		if (args.created) {
			$scope.campaign.dateos.unshift(args.dateo);
			idxToDateoId.unshift(args.dateo.id);
			if (args.dateo.is_geolocated) addMarker(args.dateo);
			if (args.dateo.has_images) $scope.campaign.dateosWithImages.unshift(args.dateo);
			updateCampaign();
			if (!!args.dateo.position) $scope.dateamap.focusDateo(args.dateo.id);
		}
	});

	$scope.$on('user:dateoDelete', function (event, args) {
		$scope.flow.closeDateoDetail();
		$scope.flow.getDateos();
		updateCampaign();
	});

	buildLayerFiles = function () {
		if ($scope.campaign.layer_files && $scope.campaign.layer_files.length > 0) {
			leafletData.getMap("leafletCampaign")
			.then( function ( map ) {
				angular.forEach($scope.campaign.layer_files, function (lf) {
					var fname, ext;
					fname = lf.file.split('/').slice(-1)[0];
					ext   = fname.split('.').slice(-1)[0].toLowerCase();
					if (ext === 'kml') {
						$http.get(config.api.imgUrl+lf.file)
						.success( function (data) {
							L.geoJson(gjson, geoJSONStyle).addTo(map);
						} );
					}else if (ext === 'json') {
						$http.get(config.api.imgUrl+lf.file)
						.success( function (data) {
							L.geoJson(data, geoJSONStyle).addTo(map);
						} );
					}
				} );
			} );
		}
	}

	$scope.campaign.share = function () {
		var img = $scope.campaign.image ? config.api.imgUrl + $scope.campaign.image.image : config.app.url + config.defaultImgCampaignLarge;
		$modal.open( { templateUrl : 'views/share.html'
		             , controller  : 'ShareCtrl'
		             , resolve     : {
		                shareModalGivens : function () {
		                  return { url         : $scope.flow.shareableUrl
		                         , title       : $scope.campaign.name
		                         , description : $scope.campaign.short_description
		                         , image       : img}
		                 }
		             } } );
	}

	$scope.$on('user:follow', function (ev, args) {
		if (args.op === 'follow') {
			$scope.campaign.follow_count++;
		}else{
			$scope.campaign.follow_count--;
		}
		buildFollowersList();
	});

	if ( $routeParams.username && $routeParams.campaignName ) {
		buildCampaign();
		defaultMap = angular.copy( config.defaultMap );
		angular.extend( $scope.campaign.leaflet, defaultMap );
	}

	/**************************************************
		CUSTOM MARKERCLUSTER ICONS: PIES
	***************************************************/

	buildClusterIcon = function (cluster) {
		var children = cluster.getAllChildMarkers()
		  , n        = children.length
		  , d        = Piecluster.clusterSizeRange(children.length)
		  , di       = d + 1
		  , r        = d / 2
		  ,	dataObj  = {}
		  , data     = []
		  , html
		  , clusterIcon
		;

		angular.forEach(children, function (marker) {
			angular.forEach(marker.options.tags, function(tag) {
				// taking out the "other color" for tags not in secondar_tags
				//if (tag != $scope.campaign.main_tag.tag) {
				if (tag != $scope.campaign.main_tag.tag && !!$scope.subTags[tag]) {
					//tag = angular.isDefined($scope.subTags[tag]) ? tag : "Otros";
					if (!!dataObj[tag]) {
						dataObj[tag].value ++;
						dataObj[ tag ].ids.push( marker.options._id );
					}else{
						dataObj[tag] = { label: '#'+tag, value : 1, tag: tag, ids: [ marker.options._id ]};
					}
				}
			});
		});

		data = _.values(dataObj);

		html = Piecluster.makeSVGPie({
			  n             : n
			, r             : r
			, d             : d
			, data          : data
			, tags          : $scope.subTags
			, secondaryTags : $scope.subTags
		});

		clusterIcon = new L.DivIcon({
			  html: html
			, className: Piecluster.pieclusterConfig.clusterIconClassName
			, iconSize: new L.Point(di,di)
		});

		return clusterIcon;
	}

	// clusterSizeRange = d3.scale.linear()
	// 	.domain([0, 100])
	// 	.range([50, 80])
	// 	.clamp(true); 

	// makeSVGPie = function (opt) {
	// 	var svg, vis, arc, pie, arcs;
	// 	svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
	// 	vis = d3.select(svg).data([opt.data])
	// 		.attr("width", opt.d)
	// 		.attr("height", opt.d)
	// 		.append("svg:g")
	// 		.attr("transform", "translate(" + opt.r + "," + opt.r + ")");
	// 	arc = d3.svg.arc().outerRadius(opt.r);
	// 	pie = d3.layout.pie().value(function(d){return d.value;});
	// 	arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
	// 	arcs.append("svg:path").attr("fill", function(a, i){
	// 			if ($scope.campaign.secondary_tags.length == 0) return config.visualization.default_color;
	// 			if (a.data.tag == "Otros") return config.visualization.default_other_color;
	// 			return $scope.subTags[a.data.tag].color;
	// 		})
	// 		.attr("d", arc)
	// 		.attr("opacity", 0.75);

	// 	vis.append("circle")
	// 		.attr("fill", "#ffffff")
	// 		.attr("r", opt.r / 2.2)
	// 		.attr("cx", 0)
	// 		.attr("cy", 0);

	// 	vis.append("text")
	// 		.attr("x", 0)
	// 		.attr("y", 0)
	// 		.attr("class", "cpie-label")
	// 		.attr("text-anchor", "middle")
	// 		.attr("dy", '.3em')
	// 		.text(opt.n);

	// 	return serializeXmlNode(svg);
	// }

	// serializeXmlNode = function (xmlNode) {
	// 	if (typeof window.XMLSerializer != "undefined") {
 //    	return (new window.XMLSerializer()).serializeToString(xmlNode);
	// 	} else if (typeof xmlNode.xml != "undefined") {
 //    	return xmlNode.xml;
	// 	}
 //    return "";
 //  }

	$scope.campaign.leaflet.clusterOptions = { 
		  iconCreateFunction : buildClusterIcon
		//, disableClusteringAtZoom: 17
		, polygonOptions     : {
			  weight      : 1
			, fillColor   : "#999"
			, color       : '#999'
			, fillOpacity : 0.4
		}
	};

	$scope.flow.onLegendRender = function () {
		var h = angular.element('.legend-holder .tag-list').height();
		if (h > 23) $scope.flow.showLegendExpandLink = true;
	}

	$scope.flow.expandLegend = function() {
		angular.element('.legend-holder').addClass('expanded');
		$scope.flow.showLegendExpandLink = false;
		$scope.flow.showLegendContractLink = true;
	}
	$scope.flow.contractLegend = function() {
		angular.element('.legend-holder').removeClass('expanded');
		$scope.flow.showLegendExpandLink = true;
		$scope.flow.showLegendContractLink = false;
	}

	$document.on('scroll', function() {
		var st = $document.scrollTop();
		if (typeof(cardHeight) == 'undefined' && angular.element('.viz-holder').size()) cardHeight = angular.element('.viz-holder').position().top;
		if (cardHeight) $scope.$apply(function() { $scope.flow.titleFix = st > cardHeight - 60; });
	});

	/** EMBED BUILDER **/
	$scope.flow.loadEmbedBuilder = function () {
		$modal.open( { templateUrl : 'views/embedbuilder.html'
		             , controller  : 'EmbedbuilderCtrl'
		             , resolve     : {
		               embedBuilderGivens : function () {
		                 return {
		                 	  author  : $scope.campaign.user.username
		                 	, mainTag : $scope.campaign.main_tag.tag
		                 	, path    : $location.path() 
		                 };
		               }
		             }
		             } );
	};

	$(window).resize(function (){
		safariMapLayoutFix();
	});

	safariMapLayoutFix = function () {
		if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) {
			var $mh = $('.dateo-map-viz');
			var h = $mh.height();
			$('.dateos-holder').css('height', h+'px');
			if ($scope.flow.hasLegend) {
				h -= 32;
			}
	  	$('.leaflet-map-holder').css('height', h+'px');
	  	leafletData.getMap("leafletCampaign")
			.then( function ( map ) {
				map.invalidateSize();
			});
		};
	}
 
	$scope.$on('$destroy', function () {
		markersBounds   = [];
		$scope.campaign = {};
		leafletMarkersHelpers.resetCurrentGroups();
		Datear.resetContext();
		$(window).off('resize');
	});

} ] );
