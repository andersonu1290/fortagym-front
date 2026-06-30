import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionHorariosNutri } from './gestion-horarios-nutri';

describe('GestionHorariosNutri', () => {
  let component: GestionHorariosNutri;
  let fixture: ComponentFixture<GestionHorariosNutri>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionHorariosNutri]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionHorariosNutri);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
