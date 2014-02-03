'use strict';

describe('Service: HiitData', function () {

  // load the service's module
  beforeEach(module('shiitApp'));

  // instantiate service
  var HiitData;
  beforeEach(inject(function (_HiitData_) {
    HiitData = _HiitData_;
  }));

  it('should do something', function () {
    expect(!!HiitData).toBe(true);
  });

});
