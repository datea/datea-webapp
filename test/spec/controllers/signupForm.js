'use strict';

describe('Controller: SignupformCtrl', function () {

  // load the controller's module
  beforeEach(module('dateaWebApp'));

  var SignupformCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SignupformCtrl = $controller('SignupformCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
