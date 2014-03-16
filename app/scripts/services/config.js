'use strict';

angular
.module('dateaWebApp')
.constant('config',
	{ app     : { name : 'Datea.pe'
	            , url  : 'http://localhost:9000/#/'
	            }
	, api     : { url    : 'http://173.255.200.68/api/v2/'
	            , imgUrl : 'http://173.255.200.68/' }
	, marker  : ['<div class="marker-holder">'
	              ,'<img src="http://api.datea.pe/{{user.image_small}}" alt="user image">'
	              ,'<h5>por {{user.username}}</h5>'
	              ,'<span class="date">{{_prettyDate}}</span>'
	              ,'<span class="tag">#{{tags[0].tag}}</span>'
	              ,'<p>{{extract}}</p>'
	              ,'<a href="#{{user.username}}/dateos/{{id}}" target="_blank">Leer más</a>'
	            ,'</div>'
	            ].join('')
	, selectFilter : { 'last'          : ''
	                 , 'mostVoted'     : '-vote_count,-created'
	                 , 'mostCommented' : '-comment_count,-created'
	                 }
	, dateo   : { sizeImgMax    : 35000
	            , sizeImgMaxMsg : 'Su archivo es muy grande'
	            , tagsMax       : 7
	            }
	, defaultMap : { center   : { lat: -12.05, lng: -77.06, zoom: 13 }
	               , defaults : { scrollWheelZoom: false }
	               , markers  : {}
	               }
	, defaultImgProfile : 'static/images/globals/user-profile-default.png'
	, defaultImgBackground : 'static/images/globals/campaign-default.jpg'
	, homeSI : { campaignsOffset : 6
	           , paginationLimit : 6
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
	            , defaultMarkersImage : '/static/images/globals/'
	            }
	, profile : { dateosOffset    : 3
	            , campaignsOffset : 3
	            , paginationLimit : 3
	            }
	, activityLog : { activityVerbs : [ 'dateo', 'commented', 'voted' ]
	                , activityContentMsg : { onUser : { 'dateo'     : 'dateó en #{{action_object.tags[0].tag}}'
	                                                  , 'commented' : 'comentó tu dateo en #{{action_object.tags[0].tag}}'
	                                                  , 'voted'     : 'apoyó tu dateo en #{{action_object.tags[0].tag}}'
	                                                  }
	                                       , byUser : { 'dateo'     : 'dateaste en #{{action_object.tags[0].tag}}'
	                                                  , 'commented' : 'comentaste el dateo de {{target_user.username}} en #{{target_object.tags[0].tag}}'
	                                                  , 'voted'     : 'apoyaste el dateo de {{target_user.username}}'
	                                                  }
	                                       }
	                }
	, campaign : { mapZoomFocus : 15 }
	}
);

{ }