import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RutinaUsuarios } from './rutina-usuarios';

describe('RutinaUsuarios', () => {
  let component: RutinaUsuarios;
  let fixture: ComponentFixture<RutinaUsuarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutinaUsuarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RutinaUsuarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
