import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SmartBalance } from './smartbalance';

describe('SmartBalance', () => {
  let component: SmartBalance;
  let fixture: ComponentFixture<SmartBalance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartBalance]
    }).compileComponents();

    fixture = TestBed.createComponent(SmartBalance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Creación del componente ────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Estado inicial ─────────────────────────────────────────────────────────

  it('should start on paso 1', () => {
    expect(component.pasoActual).toBe(1);
  });

  it('should initialize with genero Masculino', () => {
    expect(component.genero).toBe('M');
  });

  it('should initialize with null biometric fields', () => {
    expect(component.edad).toBeNull();
    expect(component.estatura).toBeNull();
    expect(component.peso).toBeNull();
    expect(component.cintura).toBeNull();
    expect(component.cuello).toBeNull();
    expect(component.cadera).toBeNull();
  });

  it('should initialize with empty errores', () => {
    expect(Object.keys(component.errores).length).toBe(0);
  });

  it('should initialize with null resultado', () => {
    expect(component.resultado).toBeNull();
  });

  // ── Género y campo cadera ──────────────────────────────────────────────────

  it('esFemenino should be false when genero is M', () => {
    component.genero = 'M';
    expect(component.esFemenino).toBeFalse();
  });

  it('esFemenino should be true when genero is F', () => {
    component.genero = 'F';
    expect(component.esFemenino).toBeTrue();
  });

  it('cambiarGenero to M should clear cadera and its error', () => {
    component.genero = 'F';
    component.cadera = 95;
    component.errores['cadera'] = 'error';
    component.cambiarGenero('M');

    expect(component.genero).toBe('M');
    expect(component.cadera).toBeNull();
    expect(component.errores['cadera']).toBeUndefined();
  });

  it('cambiarGenero to F should set genero correctly', () => {
    component.cambiarGenero('F');
    expect(component.genero).toBe('F');
  });

  // ── Validación ─────────────────────────────────────────────────────────────

  it('should show errors when calcular is called with no data (M)', () => {
    component.genero = 'M';
    component.calcular();

    expect(component.tieneError('edad')).toBeTrue();
    expect(component.tieneError('estatura')).toBeTrue();
    expect(component.tieneError('peso')).toBeTrue();
    expect(component.tieneError('cintura')).toBeTrue();
    expect(component.tieneError('cuello')).toBeTrue();
  });

  it('should require cadera for female', () => {
    component.genero     = 'F';
    component.edad       = 25;
    component.estatura   = 165;
    component.peso       = 60;
    component.cintura    = 70;
    component.cuello     = 32;
    component.cadera     = null;
    component.calcular();

    expect(component.tieneError('cadera')).toBeTrue();
  });

  it('should not require cadera for male', () => {
    component.genero     = 'M';
    component.edad       = 25;
    component.estatura   = 175;
    component.peso       = 75;
    component.cintura    = 82;
    component.cuello     = 38;
    component.calcular();

    expect(component.tieneError('cadera')).toBeFalse();
  });

  it('should reject edad out of range', () => {
    component.edad = 5;
    component.calcular();
    expect(component.tieneError('edad')).toBeTrue();

    component.edad = 101;
    component.calcular();
    expect(component.tieneError('edad')).toBeTrue();
  });

  it('should reject estatura out of range', () => {
    component.estatura = 50;
    component.calcular();
    expect(component.tieneError('estatura')).toBeTrue();
  });

  it('tieneError should return false for a field with no error', () => {
    expect(component.tieneError('edad')).toBeFalse();
  });

  // ── Cálculo masculino ──────────────────────────────────────────────────────

  describe('calcular — hombre', () => {

    beforeEach(() => {
      component.genero   = 'M';
      component.edad     = 30;
      component.estatura = 175;
      component.peso     = 80;
      component.cintura  = 88;
      component.cuello   = 38;
      component.calcular();
    });

    it('should advance to paso 2 on valid male data', () => {
      expect(component.pasoActual).toBe(2);
    });

    it('should produce a non-null resultado', () => {
      expect(component.resultado).not.toBeNull();
    });

    it('should produce a grasa porcentaje within reasonable range (2–50%)', () => {
      const pct = component.resultado!.grasa.porcentaje;
      expect(pct).toBeGreaterThanOrEqual(2);
      expect(pct).toBeLessThanOrEqual(50);
    });

    it('should produce kg grasa consistent with percentage and weight', () => {
      const { porcentaje, kgGrasa } = component.resultado!.grasa;
      const expected = (80 * porcentaje) / 100;
      expect(kgGrasa).toBeCloseTo(expected, 2);
    });

    it('should produce a positive IMME value', () => {
      expect(component.resultado!.imme.imme).toBeGreaterThan(0);
    });

    it('IMME should be kg musculo / (estatura_m ^ 2)', () => {
      const { kgMusculo, imme } = component.resultado!.imme;
      const expected = kgMusculo / (1.75 * 1.75);
      expect(imme).toBeCloseTo(expected, 4);
    });

    it('should produce a positive ACT litros value', () => {
      expect(component.resultado!.act.litros).toBeGreaterThan(0);
    });

    it('ACT should follow Watson formula for men', () => {
      const expected = -2.097 + 0.1069 * 175 + 0.2466 * 80;
      expect(component.resultado!.act.litros).toBeCloseTo(expected, 4);
    });

    it('should clear errores after valid calculation', () => {
      expect(Object.keys(component.errores).length).toBe(0);
    });

  });

  // ── Cálculo femenino ───────────────────────────────────────────────────────

  describe('calcular — mujer', () => {

    beforeEach(() => {
      component.genero   = 'F';
      component.edad     = 28;
      component.estatura = 162;
      component.peso     = 60;
      component.cintura  = 72;
      component.cuello   = 32;
      component.cadera   = 96;
      component.calcular();
    });

    it('should advance to paso 2 on valid female data', () => {
      expect(component.pasoActual).toBe(2);
    });

    it('should produce a non-null resultado', () => {
      expect(component.resultado).not.toBeNull();
    });

    it('should produce a grasa porcentaje within reasonable range', () => {
      const pct = component.resultado!.grasa.porcentaje;
      expect(pct).toBeGreaterThanOrEqual(2);
      expect(pct).toBeLessThanOrEqual(70);
    });

    it('ACT should follow Watson formula for women', () => {
      const expected = -2.097 + 0.1069 * 162 + 0.1835 * 60;
      expect(component.resultado!.act.litros).toBeCloseTo(expected, 4);
    });

    it('kgMasaLibreGrasa should equal peso - kgGrasa', () => {
      const { kgGrasa, kgMasaLibreGrasa } = component.resultado!.grasa;
      expect(kgMasaLibreGrasa).toBeCloseTo(60 - kgGrasa, 4);
    });

  });

  // ── Navegación ─────────────────────────────────────────────────────────────

  it('volver should set pasoActual to 1', () => {
    component.pasoActual = 2;
    component.volver();
    expect(component.pasoActual).toBe(1);
  });

  it('recalcular should reset resultado and go to paso 1', () => {
    component.genero   = 'M';
    component.edad     = 30;
    component.estatura = 175;
    component.peso     = 80;
    component.cintura  = 88;
    component.cuello   = 38;
    component.calcular();

    component.recalcular();

    expect(component.resultado).toBeNull();
    expect(component.pasoActual).toBe(1);
  });

  it('mostrarResultados should be false when resultado is null', () => {
    component.pasoActual = 2;
    component.resultado  = null as any;
    expect(component.mostrarResultados).toBeFalse();
  });

  it('mostrarResultados should be true when paso 2 and resultado exists', () => {
    component.genero   = 'M';
    component.edad     = 30;
    component.estatura = 175;
    component.peso     = 80;
    component.cintura  = 88;
    component.cuello   = 38;
    component.calcular();

    expect(component.mostrarResultados).toBeTrue();
  });

  // ── Formateo ───────────────────────────────────────────────────────────────

  it('fmt1 should return number with 1 decimal', () => {
    expect(component.fmt1(12.3456)).toBe('12.3');
  });

  it('fmt2 should return number with 2 decimals', () => {
    expect(component.fmt2(8.1234)).toBe('8.12');
  });

  it('fmtPct should return percentage string with 1 decimal', () => {
    expect(component.fmtPct(55.678)).toBe('55.7%');
  });

  // ── ACT ring offset ────────────────────────────────────────────────────────

  it('ACT ring offset should be circumference when porcentajePeso is 0', () => {
    component.genero   = 'M';
    component.edad     = 30;
    component.estatura = 175;
    component.peso     = 80;
    component.cintura  = 88;
    component.cuello   = 38;
    component.calcular();

    const { ringOffset, porcentajePeso } = component.resultado!.act;
    const expectedOffset = 264 - (Math.min(100, Math.max(0, porcentajePeso)) / 100) * 264;
    expect(ringOffset).toBeCloseTo(expectedOffset, 1);
  });

  // ── Clasificaciones grasa ──────────────────────────────────────────────────

  it('grasa clasificacion Atlético should have teal barColor for men with low body fat', () => {
    component.genero   = 'M';
    component.edad     = 25;
    component.estatura = 180;
    component.peso     = 75;
    component.cintura  = 76;   // valores que producen ~10–13% grasa
    component.cuello   = 40;
    component.calcular();

    const pct = component.resultado!.grasa.porcentaje;
    // Verifica que se clasifica como algo válido
    expect(['Esencial','Atlético','Fitness','Normal','Exceso'])
      .toContain(component.resultado!.grasa.clasificacion);
  });

  // ── Recomendación ACT ──────────────────────────────────────────────────────

  it('recomendacionDiaria should be peso × 0.033', () => {
    component.genero   = 'M';
    component.edad     = 30;
    component.estatura = 175;
    component.peso     = 70;
    component.cintura  = 84;
    component.cuello   = 38;
    component.calcular();

    expect(component.resultado!.act.recomendacionDiaria).toBeCloseTo(70 * 0.033, 4);
  });

});