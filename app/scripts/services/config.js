'use strict';

angular
.module('dateaWebApp')
.constant('config',
	{ app     : { name : 'Datea.pe'
	            , url  : 'http://localhost:9000'
	            }
	, api     : { url    : 'http://api.datea.pe/api/v2/'
	            , imgUrl : 'http://api.datea.pe' //'http://173.255.200.68' 
	          	} 
	, marker  : ['<div class="marker-holder">'
	              ,'<img class="img-circle" src="{{user.markerImage}}" alt="user image">'
	              ,'<div class="part">'
	                ,'<h5>{{user.username}}</h5>'
	                ,'<span class="date">{{_prettyDate}}</span>'
	              ,'</div>'
	              // ,'<span class="tag">#{{tags[0].tag}}</span>'
	              ,'<p>{{extract}}</p>'
	              //,'<a class="btn datea-gray-btn btn-xs pull-right" href="#{{user.username}}/dateos/{{id}}" target="_blank">ver más</a>'
	              , '<a class="popup-detail-btn btn datea-gray-btn btn-xs pull-right" data-index="{{index}}" href="#{{user.username}}/dateos/{{id}}">ver detalle</a>'
	              ,'<div class="stats">'
	              ,		'<span class="stat"><span class="glyphicon glyphicon-thumbs-up"></span>{{vote_count}}</span>'
	              ,		'<span class="stat"><span class="glyphicon glyphicon-comment"></span>{{comment_count}}</span>'
	              ,'</div>'
	            ,'</div>'
	            ].join('')
	, selectFilter : { 'last'          : ''
	                 , 'mostVoted'     : '-vote_count,-created'
	                 , 'mostCommented' : '-comment_count,-created'
	                 }
	, dateo   : { sizeImgMax    : 3500000
	            , sizeImgMaxMsg : 'Su archivo es muy grande'
	            , tagsMax       : 7
	            }
	, defaultMap : { bounds   : [ [ -12.0735, -77.0336 ], [ -12.0829, -77.0467 ] ]
	               , center   : { lat: -12.05, lng: -77.06, zoom: 14 }
	               , defaults : { scrollWheelZoom: false }
	               , markers  : {}
	               , tiles    : { url     : 'http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png'
															, options : { attribution : 'Tiles by <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
																					, subdomains  : ['otile1','otile2','otile3','otile4']
																					}
	               							}
	               }
	, defaultDateFormat : "d 'de' MMMM yyyy - H:mm"
	, shortDateFormat : "d/MM/yyyy - H:mm" 
	, defaultBoundsRatio : +0.0075
	, defaultImgProfile : '/static/images/globals/user-default.png'
	, defaultImgBackground : '/static/images/globals/bg-gris.png'
	, defaultImgCampaign: "/static/images/globals/campaign-default.jpg"
	, homeSI : { campaignsOffset : 8
	           , paginationLimit : 6
	           , mapZoomOverride : 13
	           , zoomAfterDatear : 16
	           , dateosLimitByRequest : 100
	           , defaultMarkersImage : '/static/images/globals/'
	           }
	, profile : { dateosOffset    : 10
	            , campaignsOffset : 10
	            , paginationLimit : 10
	            }
	, activityLog : { activityVerbs : [ 'dateo', 'commented', 'voted' , 'redateo', 'campaign']
	          		  , activityContentMsg : { onUser : { 'dateo'     : '{{actor.username}} dateó {{tags}}'
			                                              , 'commented' : '{{actor.username}} comentó tu dateo {{tags}}'
			                                              , 'voted'     : '{{actor.username}} apoyó tu dateo {{tags}}'
			                                              , 'redateo'   : '{{actor.username}} redateó tu dateo {{tags}}'
			                                              }
			                                   , byUser : { 'dateo'     : 'dateaste en {{tags}}'
			                                              , 'commented' : 'comentaste el dateo de {{target_user.username}} {{tags}}'
			                                              , 'voted'     : 'apoyaste el dateo de {{target_user.username}} {{tags}}'
			                                              , 'redateo'   : 'redateaste a {{target_user.username}} {{tags}}'
			                   										 	  		, 'campaign'  : 'creaste una iniciativa {{tags}}'
			                                              }
			                                   , anyUser :{ 'dateo'     : '{{actor.username}} dateó {{tags}}'
			                                  					  , 'commented' : '{{actor.username}} comentó dateo de {{target_user.username}} {{tags}}'
			                                  					  , 'voted'     : '{{actor.username}} apoyó dateo de {{target_user.username}} {{tags}}'
			                                  					  , 'redateo'   : '{{actor.username}} redateó a {{target_user.username}} {{tags}}'
			                                  					  , 'campaign'  : '{{actor.username}} creó una iniciativa {{tags}}'
			                                  					  }
			                                   }
			          }
	, campaign : { mapZoomFocus : 15 }
	, dashboard : { defaultZoom : 14
	              , validationMsgs : { mainTagExists    : 'La etiqueta ya está siendo usada en alguna iniciativa. Al menos que quieras compartirla, usa otra.' 
	              									 , duplicateUserTag : 'Ya has utilizado esta etiqueta en otra iniciativa. Si quieres reutilizarla, debes llenar el campo "Componente de URL". De otro modo mejor cámbiala.' 
	              									 , slugError        : 'Esta url ya esta siendo utilizada. Por favor, elige otra.'
	              									 , emptyField       : 'Campo obligatorio'
	              									 }
	              }
	, signupForm : { validationMsgs : { usernameExists : 'El nombre de usuario ya ha sido usado.'
																		, emailExists    : 'La dirección ya está siendo utilizada. ¡Recupera tu contraseña!'
	                                  , http400        : 'El nombre de usuario o correo ya está siendo usado.'} }
	, accountMsgs : {
			  userBannedMsg         : 'Tu usuario ha sido blockeado. Si piensas que esto es injusto, por favor comunicate con nosotros a traves de nuestro <a href="http://ayuda.datea.pe/contacto">formulario de contacto</a>.'
			, userWelcomeReadyMsg   : 'Tu cuenta ha sido activada y ya estás listo(a) para datear. Si quieres, antes puedes hacer ajustes a la configuración de tu usuario acá abajo.'
			, userWelcomeConfirmMsg : 'Ya casi eres datero(a)! Falta que nos confirmes tu dirección de correo (Twitter no nos provee ese dato). Una vez confirmada tu cuenta estarás listo(a) para datear.'
			, duplicateEmailMsg     : 'La dirección de correo ya existe. Por favor utiliza otra, o si no recuerdas tu usuario, puedes salir y recuperar tu clave. Si ingresaste con otro servico (Facebook), por favor vuelve a ingresar con ese servicio.'
			, duplicateUsernameMsg  : 'El nombre de usuario ya existe. Por favor, elige otro.'
			, checkEmailMsg         : '¡Gracias! Ahora revisa tu correo y sigue las instrucciones para activar tu cuenta. Si deseas, puedes cerrar esta ventana.'
			, userConfirmEmailMsg   : 'Antes de poder datear, necesitamos verificar tu dirección de correo. Ingrésala aquí abajo. ¡Gracias!'
			, userConfirmMissingMsg : 'Falta que nos confirmes tu correo para activar tu cuenta. Por favor, chequea tu correo y sigue las instrucciones que te enviamos. Si deseas recibir otro correo de activación, vuelve a cliquear en "Enviar". ¡Gracias!'
			, userConfirmSuccessMsg : 'Tu cuenta ha sido plenamente activada y estas listo(a) para datear. Si deseas, puedes antes hacer ajustes a tu cuenta acá abajo.'
			, registerActivationCompleteMsg : 'Tu cuenta ha sido activada. Ahora puedes ingresar con tu usuario y contraseña.'
			, PasswdResetEmailMsg   : 'Por favor revisa tu correo y sigue las instrucciones para recuperar tu contraseña.'
			, PasswdResetNotFoundMsg: 'No existen dateros con esa dirección ;)'  
	}
	, unknownErrorMsg : 'Hubo un error. Por favor revisa tus datos e intenta de nuevo. Si no funciona, <a href="http://ayuda.datea.pe/contacto">contáctanos</a>.'
	, regex : { email: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
	          , text : /^([a-záéíóúñÑÁÉÍÓÚA-Z \-])+$/}

	, layout_100: [] 
	, visualization: { default_other_color : '#CCCCCC'
									 , default_color      : '#28BC45'
									 , markerSvgPath   : 'M14.087,0.485c-7.566,0-13.694,6.133-13.698,13.695c0.027,3.938,2.02,8.328,4.637,10.878'
																		 + 'c2.615,3.363,6.536,8.889,6.488,11.033v0.07c0,4.195,0.364,3.92,0.4,4.051c0.128,0.441,0.527,0.746,0.99,0.746h2.179'
																		 + 'c0.464,0,0.858-0.309,0.983-0.74c0.04-0.137,0.407,0.139,0.411-4.057c0-0.039-0.004-0.059-0.004-0.068'
																		 + 'c-0.038-2.047,3.399-7.35,6.109-10.877c2.875-2.498,5.175-6.814,5.196-11.035C27.779,6.618,21.65,0.485,14.087,0.485z'
									 , markerWidth     : 29
									 , markerHeight    : 42  
									 , defaultMarkerIcon : { type     		: 'div'
																				 , iconSize 		: [29, 42]
																				 , iconAnchor	  : [14.5, 43]
																				 , popupAnchor	: [0, -33]
																				 , labelAnchor	: [8, -25]
																				 , className    : 'datea-pin-icon'
																				 , html     		: '<svg width="29" height="43"><g style="clip-path: url(#pinpath);">'
																							 				+ 	'<rect height="43" width="29" fill="#28BC45" />'
																							 				+ 	'<circle cx="14.5" cy="13" r="4" fill="white" />'
																							 				+   '<path d="M14.087,0.485c-7.566,0-13.694,6.133-13.698,13.695c0.027,3.938,2.02,8.328,4.637,10.878'
																		 									+ 'c2.615,3.363,6.536,8.889,6.488,11.033v0.07c0,4.195,0.364,3.92,0.4,4.051c0.128,0.441,0.527,0.746,0.99,0.746h2.179'
																		 									+ 'c0.464,0,0.858-0.309,0.983-0.74c0.04-0.137,0.407,0.139,0.411-4.057c0-0.039-0.004-0.059-0.004-0.068'
																		 									+ 'c-0.038-2.047,3.399-7.35,6.109-10.877c2.875-2.498,5.175-6.814,5.196-11.035C27.779,6.618,21.65,0.485,14.087,0.485z"'
																		 									+ ' stroke="#888888" fill="none" stroke-width="1" />'
																					 		 				+ '</g></svg>'
																			   }  
									 }      
	}
);

