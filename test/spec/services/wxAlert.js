'use strict';

describe('Service: Wxalert', function () {

  // load the service's module
  beforeEach(module('dateaWebApp'));

  // instantiate service
  var Wxalert;
  beforeEach(inject(function(_Wxalert_) {
    Wxalert = _Wxalert_;
  }));

  it('should do something', function () {
    expect(!!Wxalert).toBe(true);
  });

});
