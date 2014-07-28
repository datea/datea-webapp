angular.module("dateaWebApp")
.directive("daVote", 
[
  'Api'
, 'User'
, '$location'
, function (
	  Api
	, User
	, $location
) {
	
	return {
		  restrict    : "E"
		, templateUrl : "/views/vote-button.html"
		, replace		  : true
		, scope: {
			   btnClass  		: '@'
		   , voteObj 			: '@'
		   , voteId  			: '='
		   , voteCallback : '=?'
		   , voteCount    : '='
		}
		, controller : function ($scope, $element, $attrs) {

			var checkHasVoted;

			$scope.vote              = {};
			$scope.flow              = {};
			$scope.flow.isActive     = false;
			$scope.flow.loading      = false;
			$scope.flow.disabled     = true;

			$scope.$watch('voteId', function () {
				checkHasVoted();
			});

			checkHasVoted = function () {
				if (User.isSignedIn() && $scope.voteId) {
					Api.vote
					.getVotes( { user : User.data.id, vote_key : $scope.voteObj+'.'+$scope.voteId } )
					.then( function ( response ) {
						$scope.flow.disabled = false;
						$scope.flow.isActive = response.meta.total_count ? true : false;
					}, function ( reason ) {
						console.log( reason );
						$scope.flow.disabled  = false;
					} )
				}else{
					$scope.flow.disabled = false;
				}
			}

			$scope.flow.doVote = function () {
				if (!User.isSignedIn()) {
					$location.path('/registrate');
				}
				else if ( !$scope.flow.loading && !$scope.flow.disabled && !$scope.flow.isActive) {
					$scope.flow.loading = true;
					Api.vote
					.doVote( { vote_key : $scope.voteObj+'.'+$scope.voteId } )
					.then( function ( response ) {
						console.log( 'doVote', response );
						$scope.voteCount++;
						if (typeof($scope.voteCallback) != 'undefined') $scope.voteCallback(response);
						$scope.flow.loading  = false;
						$scope.flow.isActive = true;
					}, function ( reason ) {
						console.log( reason );
						$scope.flow.loading = false;
					} );
				} 
			}
		}
	}
} ] );
