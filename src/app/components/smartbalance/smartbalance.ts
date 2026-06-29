import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ── Interfaces ──────────────────────────────────────────────────────────────

export type Genero = 'M' | 'F';
export type MetricaClasif = 'Esencial' | 'Atlético' | 'Fitness' | 'Normal' | 'Exceso' | 'Bajo' | 'Alto' | 'Óptimo' | 'Elevado';

export interface ResultadoGrasa {
  porcentaje: number;
  kgGrasa: number;
  kgMasaLibreGrasa: number;
  clasificacion: MetricaClasif;
  targetSaludable: string;
  barPct: number;
  barColor: string;
}

export interface ResultadoIMME {
  kgMusculo: number;
  kgMasaOsea: number;
  imme: number;
  clasificacion: MetricaClasif;
  barPct: number;
  barColor: string;
}

export interface ResultadoACT {
  litros: number;
  porcentajePeso: number;
  estado: string;
  estadoBadgeClass: string;
  recomendacionDiaria: number;
  ringOffset: number;
}

export interface ResultadoComposicion {
  grasa: ResultadoGrasa;
  imme: ResultadoIMME;
  act: ResultadoACT;
}

// ── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-smartbalance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './smartbalance.html',
  styleUrls: ['./smartbalance.scss']
})
export class SmartBalance implements OnInit {

  // ── Estado de pasos ───────────────────────────────────────────────────────
  pasoActual: number = 1;  // 1 = formulario, 2 = resultados

  // ── Datos del formulario ──────────────────────────────────────────────────
  genero: Genero = 'M';
  edad: number | null = null;
  estatura: number | null = null;  // cm
  peso: number | null = null;      // kg
  cintura: number | null = null;   // cm
  cuello: number | null = null;    // cm
  cadera: number | null = null;    // cm — solo femenino

  // ── Errores de validación ─────────────────────────────────────────────────
  errores: Record<string, string> = {};

  // ── Resultados calculados ─────────────────────────────────────────────────
  resultado: ResultadoComposicion | null = null;

  // SVG ring circumference: 2π × 42 ≈ 264
  readonly RING_CIRCUMFERENCE = 264;

  constructor() {}

  ngOnInit(): void {}

  // ── Getters de conveniencia para el template ──────────────────────────────

  get esFemenino(): boolean {
    return this.genero === 'F';
  }

  get mostrarResultados(): boolean {
    return this.pasoActual === 2 && this.resultado !== null;
  }

  // ── Cambio de género ──────────────────────────────────────────────────────

  cambiarGenero(g: Genero): void {
    this.genero = g;
    if (g === 'M') {
      this.cadera = null;
      delete this.errores['cadera'];
    }
  }

  // ── Validación ────────────────────────────────────────────────────────────

  private validar(): boolean {
    this.errores = {};

    if (!this.edad || this.edad < 10 || this.edad > 100)
      this.errores['edad'] = 'Ingresa una edad válida (10–100 años).';

    if (!this.estatura || this.estatura < 100 || this.estatura > 250)
      this.errores['estatura'] = 'Ingresa una estatura válida (100–250 cm).';

    if (!this.peso || this.peso < 20 || this.peso > 300)
      this.errores['peso'] = 'Ingresa un peso válido (20–300 kg).';

    if (!this.cintura || this.cintura < 40 || this.cintura > 200)
      this.errores['cintura'] = 'Ingresa una circunferencia válida.';

    if (!this.cuello || this.cuello < 20 || this.cuello > 80)
      this.errores['cuello'] = 'Ingresa una circunferencia válida.';

    if (this.genero === 'F') {
      if (!this.cadera || this.cadera < 40 || this.cadera > 200)
        this.errores['cadera'] = 'Ingresa la circunferencia de cadera.';
    }

    return Object.keys(this.errores).length === 0;
  }

  tieneError(campo: string): boolean {
    return !!this.errores[campo];
  }

  // ── Cálculo principal ─────────────────────────────────────────────────────

  calcular(): void {
    if (!this.validar()) return;

    const edad     = this.edad!;
    const estatura = this.estatura!;        // cm
    const peso     = this.peso!;            // kg
    const cintura  = this.cintura!;
    const cuello   = this.cuello!;
    const cadera   = this.cadera ?? 0;
    const g        = this.genero;
    const estaturaM = estatura / 100;       // metros

    // ── 1. Grasa Corporal: U.S. Navy Method ──────────────────────────────
    let pctGrasa: number;
    if (g === 'M') {
      pctGrasa = 86.010 * Math.log10(cintura - cuello)
               - 70.041 * Math.log10(estatura)
               + 36.76;
    } else {
      pctGrasa = 163.205 * Math.log10(cintura + cadera - cuello)
               - 97.684  * Math.log10(estatura)
               - 78.387;
    }
    pctGrasa = Math.max(2, Math.min(70, pctGrasa));

    const kgGrasa = peso * pctGrasa / 100;
    const kgMLG   = peso - kgGrasa;

    const resultadoGrasa = this.clasificarGrasa(pctGrasa, kgGrasa, kgMLG, peso, g);

    // ── 2. IMME (Índice de Masa Muscular Esquelética) ─────────────────────
    // Masa ósea estimada como fracción de la MLG
    const fracOsea    = g === 'M' ? 0.15 : 0.12;
    const kgMasaOsea  = kgMLG * fracOsea;

    // Masa muscular esquelética: MLG × fracción validada por género
    const fracMusculo = g === 'M' ? 0.50 : 0.46;
    const kgMusculo   = kgMLG * fracMusculo;

    // IMME = masa muscular (kg) / estatura² (m)
    const imme = kgMusculo / (estaturaM * estaturaM);

    const resultadoIMME = this.clasificarIMME(imme, kgMusculo, kgMasaOsea, g);

    // ── 3. ACT: Fórmula de Watson ─────────────────────────────────────────
    let act: number;
    if (g === 'M') {
      act = -2.097 + 0.1069 * estatura + 0.2466 * peso;
    } else {
      act = -2.097 + 0.1069 * estatura + 0.1835 * peso;
    }
    const actPct = (act / peso) * 100;

    const resultadoACT = this.clasificarACT(act, actPct, peso);

    // ── Empaquetar y avanzar ──────────────────────────────────────────────
    this.resultado = {
      grasa: resultadoGrasa,
      imme:  resultadoIMME,
      act:   resultadoACT
    };

    this.irPaso(2);
  }

  // ── Clasificaciones ───────────────────────────────────────────────────────

  private clasificarGrasa(
    pct: number,
    kgGrasa: number,
    kgMLG: number,
    peso: number,
    g: Genero
  ): ResultadoGrasa {
    const targetSaludable = g === 'M' ? '10–20%' : '18–28%';
    let clasificacion: MetricaClasif;
    let barPct: number;
    let barColor: string;

    if (g === 'M') {
      if      (pct < 6)  { clasificacion = 'Esencial'; barPct = 8;  barColor = '#8b5cf6'; }
      else if (pct < 14) { clasificacion = 'Atlético'; barPct = 25; barColor = '#14b8a6'; }
      else if (pct < 18) { clasificacion = 'Fitness';  barPct = 45; barColor = '#3b82f6'; }
      else if (pct < 25) { clasificacion = 'Normal';   barPct = 65; barColor = '#f59e0b'; }
      else               { clasificacion = 'Exceso';   barPct = 88; barColor = '#ef4444'; }
    } else {
      if      (pct < 14) { clasificacion = 'Esencial'; barPct = 8;  barColor = '#8b5cf6'; }
      else if (pct < 21) { clasificacion = 'Atlético'; barPct = 25; barColor = '#14b8a6'; }
      else if (pct < 25) { clasificacion = 'Fitness';  barPct = 45; barColor = '#3b82f6'; }
      else if (pct < 32) { clasificacion = 'Normal';   barPct = 65; barColor = '#f59e0b'; }
      else               { clasificacion = 'Exceso';   barPct = 88; barColor = '#ef4444'; }
    }

    return { porcentaje: pct, kgGrasa, kgMasaLibreGrasa: kgMLG, clasificacion, targetSaludable, barPct, barColor };
  }

  private clasificarIMME(
    imme: number,
    kgMusculo: number,
    kgMasaOsea: number,
    g: Genero
  ): ResultadoIMME {
    let clasificacion: MetricaClasif;
    let barPct: number;
    let barColor: string;

    if (g === 'M') {
      if      (imme < 7)  { clasificacion = 'Bajo';     barPct = 15; barColor = '#ef4444'; }
      else if (imme < 9)  { clasificacion = 'Normal';   barPct = 45; barColor = '#f59e0b'; }
      else if (imme < 11) { clasificacion = 'Alto';     barPct = 70; barColor = '#3b82f6'; }
      else                { clasificacion = 'Atlético'; barPct = 90; barColor = '#14b8a6'; }
    } else {
      if      (imme < 5.5) { clasificacion = 'Bajo';     barPct = 15; barColor = '#ef4444'; }
      else if (imme < 7)   { clasificacion = 'Normal';   barPct = 45; barColor = '#f59e0b'; }
      else if (imme < 8.5) { clasificacion = 'Alto';     barPct = 70; barColor = '#3b82f6'; }
      else                 { clasificacion = 'Atlético'; barPct = 90; barColor = '#14b8a6'; }
    }

    return { kgMusculo, kgMasaOsea, imme, clasificacion, barPct, barColor };
  }

  private clasificarACT(
    litros: number,
    porcentajePeso: number,
    peso: number
  ): ResultadoACT {
    let estado: string;
    let estadoBadgeClass: string;

    if      (porcentajePeso < 45) { estado = 'Bajo';    estadoBadgeClass = 'badge-danger';  }
    else if (porcentajePeso < 55) { estado = 'Normal';  estadoBadgeClass = 'badge-normal';  }
    else if (porcentajePeso < 65) { estado = 'Óptimo';  estadoBadgeClass = 'badge-success'; }
    else                          { estado = 'Elevado'; estadoBadgeClass = 'badge-info';    }

    const pctClamped = Math.min(100, Math.max(0, porcentajePeso));
    const ringOffset  = this.RING_CIRCUMFERENCE - (pctClamped / 100) * this.RING_CIRCUMFERENCE;

    return {
      litros,
      porcentajePeso,
      estado,
      estadoBadgeClass,
      recomendacionDiaria: peso * 0.033,
      ringOffset
    };
  }

  // ── Navegación ────────────────────────────────────────────────────────────

  irPaso(paso: number): void {
    this.pasoActual = paso;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  volver(): void {
    this.irPaso(1);
  }

  recalcular(): void {
    this.resultado = null;
    this.irPaso(1);
  }

  // ── Formateo de decimales para el template ────────────────────────────────

  fmt1(n: number): string { return n.toFixed(1); }
  fmt2(n: number): string { return n.toFixed(2); }
  fmtPct(n: number): string { return n.toFixed(1) + '%'; }

  // ── Formateo de inputs numéricos ──────────────────────────────────────────

  onNumerico(event: Event, campo: 'edad' | 'estatura' | 'peso' | 'cintura' | 'cuello' | 'cadera'): void {
    const input  = event.target as HTMLInputElement;
    const valor  = parseFloat(input.value);
    this[campo]  = isNaN(valor) ? null : valor;
  }
}