 'use strict';

angular.module( 'dateaWebApp' )
.controller( 'DateosAdminCtrl'
, [ '$scope'
  , 'Api'
  , 'config'
  , 'User'
  , '$routeParams'
  , '$document'
  , '$location'
  , 'shareMetaData'
  , '$translate'
, function (
    $scope
  , Api
  , config
  , User
  , $routeParams
  , $document
  , $location
  , shareMetaData
  , $translate
) {

	var getCampaign
		, buildQueryParams
		, buildTagFilterOptions
		, menuFixThold     = 60
		, listScrollPos    = 0
		, updateDateo
		, campaignResId 
		, openedDateoIndex
		, openDateo
		, openDateoById
		, processDateoStatus
		;

	$scope.flow               = {};
	$scope.flow.dashboardMode = 'admin';
	$scope.flow.loading       = false;
	$scope.flow.showDetail    = false;
	$scope.flow.leaflet       = config.defaultMap;
	$scope.dateFormat         = config.shortDateFormat;
	$scope.campaignId         = $routeParams.campaignId;
	$scope.campaign           = {};
	$scope.dateInputFormat    = 'yyyy/MM/dd';

	campaignResId  = '/api/v2/campaign/'+$scope.campaignId;

	$scope.query = {
		  page          : $location.search().page || 1
		, itemsPerPage  : 30
		, totalCount    : 0
		, orderBy	      : '-created'
		, status        : 'all'
		, tag           : 'all'
	};
	var trans = [
		  'CAMPAIGN_DASHBOARD.PAGE_TITLE'
		, 'DATEO.NEW'
		, 'DATEO.REVIEWED'
		, 'DATEO.SOLVED'
		, 'CAMPAIGN_DASHBOARD.ALL'
	];
	$translate(trans).then(function (t){
		shareMetaData.setData({title: 'Datea | '+t['CAMPAIGN_DASHBOARD.PAGE_TITLE']});
		$scope.query.statusOptions = {
				  'all'      : '-- '+t['CAMPAIGN_DASHBOARD.ALL']+' --'
				, 'new'      : t['DATEO.NEW']
				, 'reviewed' : t['DATEO.REVIEWED']
				, 'solved'   : t['DATEO.SOLVED']
		};
	});

	$scope.flow.openSincePopup = function ($event) {
		$scope.flow.sincePopup = true;
	};

	$scope.flow.openUntilPopup = function ($event) {
		$scope.flow.untilPopup = true;
	};

	getCampaign = function () {
		$scope.flow.loading = true;
		Api.campaign
		.getCampaigns( {id: $scope.campaignId} )
		.then( function (response) {
			if (response.objects.length){
				$scope.campaign = response.objects[0];
				if (User.data.id != $scope.campaign.user.id) {
						$location.path('/');
						return;
				}
				$scope.query.tags = $scope.campaign.main_tag.tag;
				buildTagFilterOptions();
				$scope.flow.getDateos();
			}else{
				$location.path('/404').replace();
			}
		}, function (reason) {
			console.log(reason);
			if ( reason.status === 404 ) {
				$location.path('/404').replace();
			}
		});
	}

	buildTagFilterOptions = function () {
		$translate('SEARCH_FILTER.ALL_TAGS').then(function (t) {
			$scope.query.tagFilterOptions = [{value: 'all', label: '-- todas --'}];
			_.each($scope.campaign.secondary_tags, function (tag){
				$scope.query.tagFilterOptions.push({value: tag.tag, label: '#'+tag.tag });
			});
		})
	}

	buildQueryParams = function () {
		var tags = [$scope.campaign.main_tag.tag]
			, params = {}
		;
		if ($scope.query.tag && $scope.query.tag !== 'all') tags.push($scope.query.tag);
		params.tags = tags.join(',');
		if (tags.length > 0) params.tag_operator = 'and';
		params.order_by = $scope.query.orderBy;
		params.limit = $scope.query.itemsPerPage;
		params.offset = ($scope.query.page -1 ) * params.limit;
		if ($scope.query.since) params['created__gt'] = $scope.query.since.toISOString();
		if ($scope.query.until) params['created__lt'] = $scope.query.until.toISOString();
		if ($scope.query.search && $scope.query.search.trim() !== '') params.q = $scope.query.search;
		if ($scope.query.status && $scope.query.status !== 'all') {
			if ($scope.query.status === 'new') {
				params.new_in_campaign_id = $scope.campaignId;
			}else{
				params.admin = $scope.query.status+':'+$scope.campaignId;
			}
		} 
		return params;
	}

	$scope.flow.getDateos = function () {
		var givens = buildQueryParams();
		$scope.campaign.dateos = [];
		$scope.flow.showDetail = false;
		$scope.flow.dateo = null;
		$scope.flow.loading = true;
		Api.dateo
		.getDateos( givens )
		.then( function (response) {
			var openedId;
			$scope.campaign.dateos = response.objects.map(function (d) {return processDateoStatus(d)});
			$scope.query.totalCount = response.meta.total_count;
			if ($location.search().item) {
				openDateoById($location.search().item);
			}
			$scope.flow.loading = false;
		}, function (reason) {
			console.log(reason);
			$scope.flow.loading = false;
		});	
	}

	$scope.flow.openDateo = function (idx) {
		$location.search('item', $scope.campaign.dateos[idx].id);
	}

	$scope.$on('$routeUpdate', function(item) {
		var id = parseInt($location.search().item);
		if (id && !$scope.flow.loading) {
			openDateoById(id);
		}else if (!id) {
			$scope.flow.closeDateo();
		} 
	});

	$scope.flow.closeDateo = function () {
		$scope.flow.dateoShown = null;
		$scope.flow.showDetail = false;
		$location.search('item', null);
		$document.scrollTop(listScrollPos);
	}

	openDateo = function (idx) {
		var dateo;
		
		$scope.flow.showDetail = true;
		openedDateoIndex = idx;
		
		dateo = $scope.campaign.dateos[idx];
		$scope.flow.dateoStatus = (dateo.admin && dateo.admin[$scope.campaignId]) ? dateo.admin[$scope.campaignId].status : 'new';
		
		listScrollPos = $document.scrollTop();

		setTimeout(function() {
			$scope.$apply(function() {$scope.flow.dateo = dateo;});
		});
		
		$scope.flow.leaflet.center  = null;
		$scope.flow.leaflet.markers = null;
		$location.search('item', dateo.id);
		if (dateo.position && dateo.position.coordinates) {
			$scope.flow.leaflet.center = { lat  : dateo.position.coordinates[1]
			                 , lng  : dateo.position.coordinates[0]
			                 , zoom : 16
			                 }
			$scope.flow.leaflet.markers = { staticy : { lat       : dateo.position.coordinates[1]
			                              , lng       : dateo.position.coordinates[0]
			                              , draggable : false
			                              } }
		}
	}

	openDateoById = function (id) {
		for (var i in $scope.campaign.dateos) {
			if ($scope.campaign.dateos[i].id == id) {
				openDateo(i);
				break;
			}
		}
	}

	$scope.flow.setDateoStatus = function () {
		var newAdmin     = {}
			, adm
			, statusExists = false
			;

		$scope.flow.statusLoading = true;

		// check if previous admin object present
		if ($scope.flow.dateo.admin && $scope.flow.dateo.admin[$scope.campaignId]) {
			
			adm = $scope.flow.dateo.admin[$scope.campaignId];

			if ($scope.flow.dateoStatus === 'new') {
				Api.dateoStatus.deleteList({id: adm.id})
				.then(function (response) {
					updateDateo($scope.flow.dateo);
					$scope.flow.statusLoading = false;
				}, function (reason) {
					console.log(reason);
				});
			}else {
				newAdmin = { 
					  id     : $scope.flow.dateo.admin[$scope.campaignId].id
					, status : $scope.flow.dateoStatus
				};
				Api.dateoStatus.patchList({objects: [newAdmin]})
				.then(function (response){
					updateDateo($scope.flow.dateo);
					$scope.flow.statusLoading = false;
				}, function (reason){
					console.log(reason);
					$scope.flow.statusLoading = false;
				});
			}
		}else if ($scope.flow.dateoStatus !== 'new'){
			newAdmin = {
				  campaign   : $scope.campaignId
				, dateo      : $scope.flow.dateo.id
				, status     : $scope.flow.dateoStatus 
			}
			Api.dateoStatus.post(newAdmin)
			.then(function (response) {
				updateDateo($scope.flow.dateo);
				$scope.flow.statusLoading = false;
			}, function (reason) {
				console.log(reason);
				$scope.flow.statusLoading = false;
			});
		}
	}

	updateDateo = function (dateo) {
		Api.dateo.getDateos({id: dateo.id})
		.then( function (response) {
			var dateo;
			dateo = processDateoStatus(response.objects[0]);
			$scope.campaign.dateos[openedDateoIndex] = dateo;
			$scope.flow.dateo = dateo;
		}, function (reason){
			console.log(reason);
		});
	}

	processDateoStatus = function (dateo) {
		if (dateo.admin && dateo.admin[$scope.campaign.id]) dateo.status = dateo.admin[$scope.campaign.id].status; 
		return dateo;
	}

	$scope.$watch('query.page', function () {
		if ($scope.campaign.id) {
			$scope.flow.getDateos();
		}
	});

	$document.on('scroll', function() {
		$scope.$apply(function() { $scope.flow.fixMenu = $document.scrollTop() > menuFixThold; });
	});

	getCampaign();



} ] );
