'use strict';

describe('Service: Parseactivityurl', function () {

  // load the service's module
  beforeEach(module('dateaWebApp'));

  // instantiate service
  var Parseactivityurl;
  beforeEach(inject(function(_Parseactivityurl_) {
    Parseactivityurl = _Parseactivityurl_;
  }));

  it('should do something', function () {
    expect(!!Parseactivityurl).toBe(true);
  });

});
