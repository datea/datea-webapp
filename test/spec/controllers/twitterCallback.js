'use strict';

describe('Controller: TwittercallbackCtrl', function () {

  // load the controller's module
  beforeEach(module('dateaWebApp'));

  var TwittercallbackCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TwittercallbackCtrl = $controller('TwittercallbackCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
