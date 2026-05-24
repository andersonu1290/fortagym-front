import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutricionFormulario } from './nutricion-formulario';

describe('NutricionFormulario', () => {
  let component: NutricionFormulario;
  let fixture: ComponentFixture<NutricionFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutricionFormulario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutricionFormulario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
