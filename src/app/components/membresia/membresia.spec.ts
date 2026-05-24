import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Membresia } from './membresia';

describe('Membresia', () => {
  let component: Membresia;
  let fixture: ComponentFixture<Membresia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Membresia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Membresia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
