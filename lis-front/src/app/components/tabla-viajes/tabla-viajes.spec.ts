import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaViajes } from './tabla-viajes';

describe('TablaViajes', () => {
  let component: TablaViajes;
  let fixture: ComponentFixture<TablaViajes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaViajes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaViajes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
