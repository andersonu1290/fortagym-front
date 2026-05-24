import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RutinaFormulario } from './rutina-formulario';

describe('RutinaFormulario', () => {
  let component: RutinaFormulario;
  let fixture: ComponentFixture<RutinaFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutinaFormulario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RutinaFormulario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
