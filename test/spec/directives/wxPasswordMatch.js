'use strict';

describe('Directive: wxPasswordMatch', function () {

  // load the directive's module
  beforeEach(module('dateaWebApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<wx-password-match></wx-password-match>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the wxPasswordMatch directive');
  }));
});
