// =============================================================
// seleccionEntrenador.component.spec.ts
// Pruebas unitarias básicas del componente SeleccionEntrenadorComponent
// =============================================================

import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  SeleccionEntrenadorComponent,
  Entrenador,
  Horario,
} from './seleccionEntrenador';

describe('SeleccionEntrenadorComponent', () => {
  let component: SeleccionEntrenadorComponent;
  let fixture: ComponentFixture<SeleccionEntrenadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionEntrenadorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SeleccionEntrenadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener el estado inicial vacío (sin entrenador ni horario seleccionado)', () => {
    expect(component.entrenadorSeleccionado).toBeNull();
    expect(component.horarioSeleccionado).toBeNull();
    expect(component.reservaConfirmada).toBeNull();
  });

  it('debería cargar exactamente 3 entrenadores de mock data', () => {
    expect(component.entrenadores.length).toBe(3);
  });

  it('debería incluir a Carlos Mendoza, Andrés Soto y David Silva', () => {
    const nombres = component.entrenadores.map((e) => e.nombre);
    expect(nombres).toContain('Carlos Mendoza');
    expect(nombres).toContain('Andrés Soto');
    expect(nombres).toContain('David Silva');
  });

  it('cada horario debería incluir el detalle de la sesión (duración, descripción y ejercicios)', () => {
    component.entrenadores.forEach((entrenador) => {
      entrenador.horarios.forEach((horario) => {
        expect(horario.sesion).toBeTruthy();
        expect(horario.sesion.duracionMinutos).toBeGreaterThan(0);
        expect(horario.sesion.descripcion).toBeTruthy();
        expect(horario.sesion.ejercicios.length).toBeGreaterThan(0);
      });
    });
  });

  it('no debería permitir confirmar la reserva en el estado inicial', () => {
    expect(component.puedeConfirmar()).toBeFalse();
  });

  describe('seleccionarEntrenador()', () => {
    it('debería asignar el entrenador seleccionado', () => {
      const entrenador = component.entrenadores[0];

      component.seleccionarEntrenador(entrenador);

      expect(component.entrenadorSeleccionado).toEqual(entrenador);
      expect(component.esEntrenadorSeleccionado(entrenador)).toBeTrue();
    });

    it('debería reiniciar el horario seleccionado al cambiar de entrenador', () => {
      const primerEntrenador = component.entrenadores[0];
      const segundoEntrenador = component.entrenadores[1];
      const horarioDisponible = primerEntrenador.horarios.find((h) => h.disponible) as Horario;

      component.seleccionarEntrenador(primerEntrenador);
      component.seleccionarHorario(horarioDisponible);
      expect(component.horarioSeleccionado).toEqual(horarioDisponible);

      component.seleccionarEntrenador(segundoEntrenador);

      expect(component.entrenadorSeleccionado).toEqual(segundoEntrenador);
      expect(component.horarioSeleccionado).toBeNull();
    });
  });

  describe('seleccionarHorario()', () => {
    let entrenador: Entrenador;

    beforeEach(() => {
      entrenador = component.entrenadores[0];
      component.seleccionarEntrenador(entrenador);
    });

    it('debería asignar un horario disponible', () => {
      const horarioDisponible = entrenador.horarios.find((h) => h.disponible) as Horario;

      component.seleccionarHorario(horarioDisponible);

      expect(component.horarioSeleccionado).toEqual(horarioDisponible);
      expect(component.esHorarioSeleccionado(horarioDisponible)).toBeTrue();
    });

    it('no debería asignar un horario marcado como no disponible', () => {
      const horarioNoDisponible = entrenador.horarios.find((h) => !h.disponible) as Horario;

      component.seleccionarHorario(horarioNoDisponible);

      expect(component.horarioSeleccionado).toBeNull();
    });
  });

  describe('confirmarReserva()', () => {
    it('no debería emitir reservaCreada si falta el entrenador o el horario', () => {
      spyOn(component.reservaCreada, 'emit');

      component.confirmarReserva();

      expect(component.reservaCreada.emit).not.toHaveBeenCalled();
      expect(component.reservaConfirmada).toBeNull();
    });

    it('debería emitir reservaCreada con el entrenador y horario correctos', () => {
      const entrenador = component.entrenadores[2];
      const horarioDisponible = entrenador.horarios.find((h) => h.disponible) as Horario;

      spyOn(component.reservaCreada, 'emit');

      component.seleccionarEntrenador(entrenador);
      component.seleccionarHorario(horarioDisponible);
      component.confirmarReserva();

      expect(component.reservaCreada.emit).toHaveBeenCalledWith({
        entrenador,
        horario: horarioDisponible,
      });
      expect(component.reservaConfirmada).toEqual({
        entrenador,
        horario: horarioDisponible,
      });
    });

    it('puedeConfirmar() debería ser true solo cuando hay entrenador y horario seleccionados', () => {
      const entrenador = component.entrenadores[1];
      const horarioDisponible = entrenador.horarios.find((h) => h.disponible) as Horario;

      expect(component.puedeConfirmar()).toBeFalse();

      component.seleccionarEntrenador(entrenador);
      expect(component.puedeConfirmar()).toBeFalse();

      component.seleccionarHorario(horarioDisponible);
      expect(component.puedeConfirmar()).toBeTrue();
    });
  });
});