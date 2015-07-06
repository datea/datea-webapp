'use strict';

angular.module('dateaWebApp')
.service('ActivityUrl', function ActivityUrl() {
	var parse;
	parse = function ( givens ) {
		var url;
		switch (givens.verb) {
			case 'dateo':
				if ( givens.action_object.user.username ) {
					url = '/' + givens.action_object.user.username + '/dateos/' + givens.action_object.id;
				} else {
					url = '/' + givens.target_object.user.username + '/dateos/' + givens.target_object.id;
				}
				break;

			case 'commented':
				if ( givens.target_object.user.username ) {
					url = '/' + givens.target_object.user.username + '/dateos/' + givens.target_object.id;
				}
				break;

			case 'voted':
				if ( givens.target_object.user.username ) {
					url = '/' + givens.target_object.user.username + '/dateos/' + givens.target_object.id;
				}
				break;

			case 'redateo':
				if ( givens.target_object.user.username ) {
					url = '/' + givens.target_object.user.username + '/dateos/' + givens.target_object.id;
				}
				break;

			case 'campaign':
					url = '/'+givens.actor.username+'/'+givens.action_object.main_tag.tag
					break;

			default:
				url = '/' 
		}
		return url;
	}

	return { parse : parse }
});
