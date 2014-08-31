'use strict';

describe('Controller: EmbedbuilderCtrl', function () {

  // load the controller's module
  beforeEach(module('dateaWebApp'));

  var EmbedbuilderCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EmbedbuilderCtrl = $controller('EmbedbuilderCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
