'use strict';

angular
.module('dateaWebApp')
.constant('config',
	{ app     : { name : 'Datea.pe'
	            , url  : 'http://localhost:9000/#/' }
	, api     : { url    : 'http://api.datea.pe/api/v2/'
	            , imgUrl : 'http://api.datea.pe/' }
  , dateo   : { sizeImgMax    : 35000
	            , sizeImgMaxMsg : 'Su archivo es muy grande'
	            , tagsMax       : 7
	            }
	, headers : { 'Authorization' : 'Apikey root:106b7be6c0028671fa6e2d57209f53ad42e14a20' }
	, defaultMap : { center   : { lat: -12.05, lng: -77.06, zoom: 13 }
	               , defaults : { scrollWheelZoom: false }
	               , markers  : {}
	               }
	, homeSI : { campaignsOffset : 12
	           , mapZoomOverride : 15
	           , activityVerbs : [ 'dateo', 'commented', 'voted' ]
	           , activityContentMsg : { onUser : { 'dateo'     : 'dateó en #{{action_object.tags[0].tag}}'
	                                             , 'commented' : 'comentó tu dateo en #{{action_object.tags[0].tag}}'
	                                             , 'voted'     : 'apoyó tu dateo en #{{action_object.tags[0].tag}}'
	                                             }
	                                  , byUser : { 'dateo'     : 'dateaste en #{{action_object.tags[0].tag}}'
	                                             , 'commented' : 'comentaste el dateo de {{target_user.username}} en #{{target_object.tags[0].tag}}'
	                                             , 'voted'     : 'apoyaste el dateo de {{target_user.username}}'
	                                             }
	                                  }
	            , dateosLimitByRequest : 100
	            }
	}
);

{ }