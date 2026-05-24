import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Nutricionista } from './nutricionista';

describe('Nutricionista', () => {
  let component: Nutricionista;
  let fixture: ComponentFixture<Nutricionista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nutricionista]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Nutricionista);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
