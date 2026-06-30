import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorariosNutriService } from '../../../../services/horarios-nutri.service';

@Component({
  selector: 'app-gestion-horarios-nutri',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-horarios-nutri.html',
  styleUrls: ['./gestion-horarios-nutri.scss'] // Usaremos el mismo estilo
})
export class GestionHorariosNutriComponent implements OnInit {
  horarios: any[] = [];

  mostrarModal = false;
  // 🔥 Nota: 'temas' en lugar de 'ejercicios' y 45 min por defecto
  horarioActual: any = { dia: 'Lunes', hora: '', duracion_minutos: 45, descripcion: '', temas: '' };
  esEdicion = false;

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  constructor(private horariosService: HorariosNutriService) {}

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
    this.horarioActual = { dia: 'Lunes', hora: '', duracion_minutos: 45, descripcion: '', temas: '' };
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
    if (!this.horarioActual.hora || !this.horarioActual.descripcion || !this.horarioActual.temas) {
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
