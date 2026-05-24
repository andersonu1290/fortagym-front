import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface PlanMembresia {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  recomendado: boolean;
  colorBoton?: string;
  features: string[];
}

@Component({
  selector: 'app-membresia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './membresia.html',
  styleUrls: ['./membresia.scss']
})
export class MembresiaComponent implements OnInit {

  pasoActual: number = 1;

  planes: PlanMembresia[] = [];

  planSeleccionado!: PlanMembresia;

  metodoPago: 'tarjeta' | 'yape' = 'tarjeta';

  terminosAceptados: boolean = false;

  constructor() {}

  ngOnInit(): void {

    this.planes = [
      {
        id: 1,
        nombre: 'Plan Black',
        descripcion: 'Fidelidad 12 meses',
        precio: 119.90,
        recomendado: true,
        colorBoton: 'black-btn',
        features: [
          'Entrena en todas las sedes del país',
          'Acceso a áreas de peso libre y máquinas',
          'Clases grupales premium ilimitadas',
          'Sillones de masajes post-entreno',
          'Invita a 5 amigos al mes gratis'
        ]
      },
      {
        id: 2,
        nombre: 'Plan Fit',
        descripcion: 'Fidelidad 12 meses',
        precio: 89.90,
        recomendado: false,
        colorBoton: 'orange-btn',
        features: [
          'Acceso a una sede de tu elección',
          'Acceso a áreas de peso libre y máquinas',
          'Clases grupales regulares',
          'Acceso a la App FortaGym',
          ''
        ]
      },
      {
        id: 3,
        nombre: 'Plan Smart',
        descripcion: 'Sin fidelidad (Cancela cuando quieras)',
        precio: 99.90,
        recomendado: false,
        colorBoton: 'orange-btn',
        features: [
          'Acceso a una sede de tu elección',
          'Acceso a áreas de peso libre y máquinas',
          'Cancela en cualquier momento sin penalidad',
          'Acceso a la App FortaGym',
          ''
        ]
      }
    ];

    this.planSeleccionado = this.planes[0];
  }

  seleccionarPlan(plan: PlanMembresia): void {
    this.planSeleccionado = plan;
  }

  calcularIGV(): number {
    return this.planSeleccionado.precio * 0.18;
  }

  calcularTotal(): number {
    return this.planSeleccionado.precio + this.calcularIGV();
  }

  irPaso(paso: number): void {

    if (paso === 2 && !this.planSeleccionado) {
      return;
    }

    this.pasoActual = paso;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  procesarPago(): void {

    if (!this.terminosAceptados) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    console.log('Pago procesado');
    console.log(this.planSeleccionado);

    this.irPaso(3);
  }

  esPlanSeleccionado(plan: PlanMembresia): boolean {
    return this.planSeleccionado.id === plan.id;
  }
}
