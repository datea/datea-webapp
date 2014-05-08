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
	              ,'<div class="part">'
	                ,'<h5>{{user.username}}</h5>'
	                ,'<span class="date">{{_prettyDate}}</span>'
	              ,'</div>'
	              // ,'<span class="tag">#{{tags[0].tag}}</span>'
	              ,'<p>{{extract}}</p>'
	              ,'<span class="glyphicon glyphicon-thumbs-up datea-glyph"></span>{{vote_count}}'
	              ,'<span class="glyphicon glyphicon-comment datea-glyph"></span>{{comment_count}}'
	              ,'<a class="btn datea-btn datea-btn-xs pull-right" href="#{{user.username}}/dateos/{{id}}" target="_blank">Leer más</a>'
	            ,'</div>'
	            ].join('')
	, selectFilter : { 'last'          : ''
	                 , 'mostVoted'     : '-vote_count,-created'
	                 , 'mostCommented' : '-comment_count,-created'
	                 }
	, dateo   : { sizeImgMax    : 350000
	            , sizeImgMaxMsg : 'Su archivo es muy grande'
	            , tagsMax       : 7
	            }
	, defaultMap : { bounds   : [ [ -12.0735, -77.0336 ], [ -12.0829, -77.0467 ] ]
	               , center   : { lat: -12.05, lng: -77.06, zoom: 13 }
	               , defaults : { scrollWheelZoom: false }
	               , markers  : {}
	               }
	, defaultBoundsRatio : +0.0075
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
	, dashboard : { defaultZoom : 14 }
	}
);

{ }