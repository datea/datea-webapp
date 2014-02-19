'use strict';

angular.module('dateaWebApp')
.service('ActivityUrl', function ActivityUrl() {
	var parse;
	parse = function ( givens ) {
		var url;
		if ( givens.verb === 'dateo' ) {
			if ( givens.action_object.user.username ) {
				url = '/' + givens.action_object.user.username + '/dateos/' + givens.action_object.id;
			} else {
				url = '/' + givens.target_object.user.username + '/dateos/' + givens.target_object.id;
			}
		} else if ( givens.verb === 'commented' ) {
			if ( givens.target_object.user.username ) {
				url = '/' + givens.target_object.user.username + '/dateos/' + givens.target_object.id;
			}
		} else if ( givens.verb === 'voted' ) {
			if ( givens.target_object.user.username ) {
				url = '/' + givens.target_object.user.username + '/dateos/' + givens.target_object.id;
			}
		}
		return url;
	}

	return { parse : parse }
});
