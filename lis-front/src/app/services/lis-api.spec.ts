import { TestBed } from '@angular/core/testing';

import { LisApi } from './lis-api';

describe('LisApi', () => {
  let service: LisApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LisApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
