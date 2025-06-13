import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioViaje } from './formulario-viaje';

describe('FormularioViaje', () => {
  let component: FormularioViaje;
  let fixture: ComponentFixture<FormularioViaje>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioViaje]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioViaje);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
