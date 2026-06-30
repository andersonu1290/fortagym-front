// =============================================================
// seleccionNutricionista.spec.ts
// Pruebas unitarias básicas del componente SeleccionNutricionistaComponent
// =============================================================

import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  SeleccionNutricionistaComponent,
  Nutricionista,
  HorarioConsulta,
} from './seleccionNutricionista';

describe('SeleccionNutricionistaComponent', () => {
  let component: SeleccionNutricionistaComponent;
  let fixture: ComponentFixture<SeleccionNutricionistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionNutricionistaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SeleccionNutricionistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener el estado inicial vacío (sin nutricionista ni horario seleccionado)', () => {
    expect(component.nutricionistaSeleccionado).toBeNull();
    expect(component.horarioSeleccionado).toBeNull();
    expect(component.reservaConfirmada).toBeNull();
  });

  it('debería tener los datos básicos del usuario vacíos por defecto', () => {
    expect(component.datosUsuario.pesoKg).toBeFalsy();
    expect(component.datosUsuario.alturaCm).toBeFalsy();
  });

  it('debería cargar exactamente 3 nutricionistas de mock data', () => {
    expect(component.nutricionistas.length).toBe(3);
  });

  it('debería incluir a María López, Lucía Torres y Camila Reyes', () => {
    const nombres = component.nutricionistas.map((n) => n.nombre);
    expect(nombres).toContain('María López');
    expect(nombres).toContain('Lucía Torres');
    expect(nombres).toContain('Camila Reyes');
  });

  it('cada horario debería incluir el detalle de la consulta (duración, descripción y temas)', () => {
    component.nutricionistas.forEach((nutricionista) => {
      nutricionista.horarios.forEach((horario) => {
        expect(horario.detalle).toBeTruthy();
        expect(horario.detalle.duracionMinutos).toBeGreaterThan(0);
        expect(horario.detalle.descripcion).toBeTruthy();
        expect(horario.detalle.temas.length).toBeGreaterThan(0);
      });
    });
  });

  it('no debería permitir confirmar la reserva en el estado inicial', () => {
    expect(component.puedeConfirmar()).toBeFalse();
  });

  describe('seleccionarNutricionista()', () => {
    it('debería asignar la nutricionista seleccionada', () => {
      const nutricionista = component.nutricionistas[0];

      component.seleccionarNutricionista(nutricionista);

      expect(component.nutricionistaSeleccionado).toEqual(nutricionista);
      expect(component.esNutricionistaSeleccionada(nutricionista)).toBeTrue();
    });

    it('debería reiniciar el horario seleccionado al cambiar de nutricionista', () => {
      const primeraNutricionista = component.nutricionistas[0];
      const segundaNutricionista = component.nutricionistas[1];
      const horarioDisponible = primeraNutricionista.horarios.find((h) => h.disponible) as HorarioConsulta;

      component.seleccionarNutricionista(primeraNutricionista);
      component.seleccionarHorario(horarioDisponible);
      expect(component.horarioSeleccionado).toEqual(horarioDisponible);

      component.seleccionarNutricionista(segundaNutricionista);

      expect(component.nutricionistaSeleccionado).toEqual(segundaNutricionista);
      expect(component.horarioSeleccionado).toBeNull();
    });
  });

  describe('seleccionarHorario()', () => {
    let nutricionista: Nutricionista;

    beforeEach(() => {
      nutricionista = component.nutricionistas[0];
      component.seleccionarNutricionista(nutricionista);
    });

    it('debería asignar un horario disponible', () => {
      const horarioDisponible = nutricionista.horarios.find((h) => h.disponible) as HorarioConsulta;

      component.seleccionarHorario(horarioDisponible);

      expect(component.horarioSeleccionado).toEqual(horarioDisponible);
      expect(component.esHorarioSeleccionado(horarioDisponible)).toBeTrue();
    });

    it('no debería asignar un horario marcado como no disponible', () => {
      const horarioNoDisponible = nutricionista.horarios.find((h) => !h.disponible) as HorarioConsulta;

      component.seleccionarHorario(horarioNoDisponible);

      expect(component.horarioSeleccionado).toBeNull();
    });
  });

  describe('datosUsuarioValidos()', () => {
    it('debería ser false si falta peso o altura', () => {
      component.datosUsuario = { pesoKg: 0, alturaCm: 0, objetivo: 'Bajar de peso' };
      expect(component.datosUsuarioValidos()).toBeFalse();

      component.datosUsuario = { pesoKg: 70, alturaCm: 0, objetivo: 'Bajar de peso' };
      expect(component.datosUsuarioValidos()).toBeFalse();
    });

    it('debería ser true cuando peso, altura y objetivo son válidos', () => {
      component.datosUsuario = { pesoKg: 68, alturaCm: 172, objetivo: 'Ganar masa muscular' };
      expect(component.datosUsuarioValidos()).toBeTrue();
    });
  });

  describe('confirmarReserva()', () => {
    it('no debería emitir reservaCreada si falta información', () => {
      spyOn(component.reservaCreada, 'emit');

      component.confirmarReserva();

      expect(component.reservaCreada.emit).not.toHaveBeenCalled();
      expect(component.reservaConfirmada).toBeNull();
    });

    it('debería emitir reservaCreada con la nutricionista, horario y datos correctos', () => {
      const nutricionista = component.nutricionistas[2];
      const horarioDisponible = nutricionista.horarios.find((h) => h.disponible) as HorarioConsulta;

      spyOn(component.reservaCreada, 'emit');

      component.seleccionarNutricionista(nutricionista);
      component.seleccionarHorario(horarioDisponible);
      component.datosUsuario = { pesoKg: 65, alturaCm: 165, objetivo: 'Mantener peso' };

      component.confirmarReserva();

      expect(component.reservaCreada.emit).toHaveBeenCalledWith({
        nutricionista,
        horario: horarioDisponible,
        datosUsuario: { pesoKg: 65, alturaCm: 165, objetivo: 'Mantener peso' },
      });
      expect(component.reservaConfirmada).toEqual({
        nutricionista,
        horario: horarioDisponible,
        datosUsuario: { pesoKg: 65, alturaCm: 165, objetivo: 'Mantener peso' },
      });
    });

    it('puedeConfirmar() debería ser true solo cuando todo está completo', () => {
      const nutricionista = component.nutricionistas[1];
      const horarioDisponible = nutricionista.horarios.find((h) => h.disponible) as HorarioConsulta;

      expect(component.puedeConfirmar()).toBeFalse();

      component.seleccionarNutricionista(nutricionista);
      expect(component.puedeConfirmar()).toBeFalse();

      component.seleccionarHorario(horarioDisponible);
      expect(component.puedeConfirmar()).toBeFalse();

      component.datosUsuario = { pesoKg: 80, alturaCm: 180, objetivo: 'Mejorar rendimiento' };
      expect(component.puedeConfirmar()).toBeTrue();
    });
  });
});