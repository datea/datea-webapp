'use strict';

describe('Filter: imgFromApi', function () {

  // load the filter's module
  beforeEach(module('dateaWebApp'));

  // initialize a new instance of the filter before each test
  var imgFromApi;
  beforeEach(inject(function($filter) {
    imgFromApi = $filter('imgFromApi');
  }));

  it('should return the input prefixed with "imgFromApi filter:"', function () {
    var text = 'angularjs';
    expect(imgFromApi(text)).toBe('imgFromApi filter: ' + text);
  });

});
