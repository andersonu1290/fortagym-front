import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutricionistaUsuarios } from './nutricion-usuarios';

describe('NutricionistaUsuarios', () => {
  let component: NutricionistaUsuarios;
  let fixture: ComponentFixture<NutricionistaUsuarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutricionistaUsuarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutricionistaUsuarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
