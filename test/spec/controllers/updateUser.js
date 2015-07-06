'use strict';

describe('Controller: UpdateuserCtrl', function () {

  // load the controller's module
  beforeEach(module('dateaWebApp'));

  var UpdateuserCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UpdateuserCtrl = $controller('UpdateuserCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
