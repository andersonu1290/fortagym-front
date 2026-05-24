import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NutricionService } from '../../../../services/nutricion.service';
import { UsuarioService } from '../../../../services/usuario.service';

@Component({
  selector: 'app-nutricion-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './nutricion-formulario.html',
  styleUrl: './nutricion-formulario.scss'
})
export class NutricionFormulario implements OnInit {
  usuarioId: number = 0;
  paciente: any = { nombre: '', apellido: '' };

  // Objeto que coincide con tu modelo Nutricion.java del backend
  nutricion: any = {
    analisisCorporal: '',
    observaciones: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private nutricionService: NutricionService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    // 1. Obtenemos el ID del paciente desde la URL
    this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));

    // 2. Cargamos el nombre del paciente para mostrarlo en el título
    this.usuarioService.getUsuarioPorId(this.usuarioId).subscribe({
      next: (data: any) => this.paciente = data,
      error: () => console.error("No se pudo cargar el paciente")
    });

    // 3. Intentamos cargar si ya existe una cartilla previa para editarla
    this.nutricionService.getNutricionPorUsuario(this.usuarioId).subscribe((data: any) => {
      if (data && !data.mensaje) {
        this.nutricion = data;
      }
    });
  }

  guardar() {
    // Preparamos el objeto para el @RequestBody del NutricionController
    const payload = {
      usuario: { id: this.usuarioId },
      analisisCorporal: this.nutricion.analisisCorporal,
      observaciones: this.nutricion.observaciones
    };

    this.nutricionService.guardarNutricion(payload).subscribe({
      next: () => {
        alert('✅ Evaluación nutricional guardada correctamente en FortaGym.');
        this.router.navigate(['/nutricion/dashboard']);
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error al guardar la cartilla. Revisa el backend.');
      }
    });
  }
}
