import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorariosService } from '../../../../services/horarios.service';

@Component({
  selector: 'app-gestion-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-horarios.html',
  styleUrls: ['./gestion-horarios.scss']
})
export class GestionHorariosComponent implements OnInit {
  horarios: any[] = [];

  // Variables para el Modal
  mostrarModal = false;
  horarioActual: any = { dia: 'Lunes', hora: '', duracion_minutos: 60, descripcion: '', ejercicios: '' };
  esEdicion = false;

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  constructor(private horariosService: HorariosService) {}

  ngOnInit(): void {
    this.cargarHorarios();
  }

  cargarHorarios(): void {
    this.horariosService.obtenerMisHorarios().subscribe({
      next: (data) => this.horarios = data,
      error: (err) => console.error('Error cargando horarios', err)
    });
  }

  abrirModalNuevo(): void {
    this.esEdicion = false;
    this.horarioActual = { dia: 'Lunes', hora: '', duracion_minutos: 60, descripcion: '', ejercicios: '' };
    this.mostrarModal = true;
  }

  abrirModalEditar(horario: any): void {
    this.esEdicion = true;
    this.horarioActual = { ...horario };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarHorario(): void {
    if (!this.horarioActual.hora || !this.horarioActual.descripcion || !this.horarioActual.ejercicios) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    this.horariosService.guardarHorario(this.horarioActual).subscribe({
      next: () => {
        this.cargarHorarios();
        this.cerrarModal();
      },
      error: (err) => alert('Error al guardar el horario')
    });
  }

  cambiarEstado(id: number): void {
    this.horariosService.cambiarEstado(id).subscribe({
      next: () => this.cargarHorarios(),
      error: () => alert('Error al cambiar el estado')
    });
  }

  eliminarHorario(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este horario? Esta acción no se puede deshacer.')) {
      this.horariosService.eliminarHorario(id).subscribe({
        next: () => this.cargarHorarios(),
        error: () => alert('Error al eliminar')
      });
    }
  }
}
