'use strict';

angular.module('dateaWebApp')
.service('ActivityTitle', ['config', 'User', '$interpolate', function ActivityUrl(config, User, $interpolate) {
	var renderTitle
		, renderTags
		;

	renderTags = function (actlog) {
		var tags, tagsWithCampaigns, result;

		switch (actlog.verb) {

			case 'dateo':
				tagsWithCampaigns = actlog.action_object.tags
														.filter(function (t) { return t.campaigns.length > 0})
														.map(function (t) {return "#"+t.tag});
				tags = actlog.action_object.tags
				       .map(function (t) {return "#"+t.tag});
				break;

			case 'commented':
				if (actlog.target_object && actlog.target_object.tags) {
					tagsWithCampaigns = actlog.target_object.tags
															.filter(function (t) { return t.campaigns.length > 0})
															.map(function (t) {return "#"+t.tag});
					tags = actlog.target_object.tags
					       .map(function (t) {return "#"+t.tag});
				}
				break;

			case 'voted':
				if (actlog.target_object && actlog.target_object.tags) {
					tagsWithCampaigns = actlog.target_object.tags
															.filter(function (t) { return t.campaigns.length > 0})
															.map(function (t) {return "#"+t.tag});
					tags = actlog.target_object.tags
					       .map(function (t) {return "#"+t.tag});
				}
				break;

			case 'redateo':
				tagsWithCampaigns = actlog.target_object.tags
														.filter(function (t) { return t.campaigns.length > 0})
														.map(function (t) {return "#"+t.tag});
				tags = actlog.target_object.tags
				       .map(function (t) {return "#"+t.tag});
				break;

			case 'campaign':
				tagsWithCampaigns = ['#'+actlog.action_object.main_tag.tag];
				tags = [];
		}

		if (tagsWithCampaigns && tagsWithCampaigns.length > 0) {
			result = tagsWithCampaigns.slice(0,2).join(', ');
			result = tagsWithCampaigns.length > 2 ? result + '...' : result;
			return 'en '+result;
		}else if (tags && tags.length > 0) {
			result = tags.slice(0,2).join(', ');
			result = tags.length > 2 ? result + '...' : result;
			return 'en '+result;
		}else {
			return '';
		}
	} 



	renderTitle = function (actlog) {
		var title, tags, mode;

		if (User.isSignedIn()) {
			if (actlog.actor.id === User.data.id) {
				mode = 'byUser'
			} else if (actlog.target_user && actlog.target_user.id === User.data.id) {
				mode = 'onUser'
			}
		}
		if (!mode) mode = 'anyUser';

		title = $interpolate( config.activityLog.activityContentMsg[mode][ actlog.verb ] )(actlog);
		tags  = renderTags(actlog);

		return title+tags;
	}



	return { createTitle : renderTitle};
} ] );
