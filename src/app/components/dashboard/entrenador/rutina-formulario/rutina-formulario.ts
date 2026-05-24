import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RutinaService } from '../../../../services/rutina.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-rutina-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './rutina-formulario.html',
  styleUrl: './rutina-formulario.scss'
})
export class RutinaFormulario implements OnInit {
  rutinaForm: FormGroup;
  usuarioId: number = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private rutinaService: RutinaService,
    private authService: AuthService
  ) {
    // Creamos la estructura del formulario reactivo
    this.rutinaForm = this.fb.group({
      usuarioId: [null],
      nombreEntrenador: ['', Validators.required],
      detalles: this.fb.array([]) // Arreglo dinámico de ejercicios
    });
  }

  ngOnInit() {
    // 1. Obtenemos el ID del usuario desde la URL
    this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));
    this.rutinaForm.patchValue({ usuarioId: this.usuarioId });

    // 2. Cargamos el nombre del entrenador logueado automáticamente
    this.authService.getPerfil().subscribe((perfil: any) => {
      this.rutinaForm.patchValue({ nombreEntrenador: perfil.nombre + ' ' + perfil.apellido });
    });

    // 3. Intentamos cargar una rutina existente para este usuario
    this.rutinaService.getRutinaUsuario(this.usuarioId).subscribe((data: any) => {
      if (data && data.detalles) {
        // Si existe, llenamos el formulario con los datos de la DB
        data.detalles.forEach((d: any) => this.agregarEjercicio(d));
      } else {
        // Si es nueva, agregamos una fila vacía para empezar
        this.agregarEjercicio();
      }
    });
  }

  // Helper para acceder fácilmente al arreglo desde el HTML
  get listaEjercicios() {
    return this.rutinaForm.get('detalles') as FormArray;
  }

  // Crea un nuevo grupo de campos para un ejercicio
  agregarEjercicio(datos: any = null) {
    const ejercicioGroup = this.fb.group({
      ejercicio: [datos?.ejercicio || '', Validators.required],
      seriesReps: [datos?.seriesReps || '', Validators.required],
      descanso: [datos?.descanso || ''],
      dias: [datos?.dias || '']
    });
    this.listaEjercicios.push(ejercicioGroup);
  }

  eliminarEjercicio(index: number) {
    this.listaEjercicios.removeAt(index);
  }

  onSubmit() {
  if (this.rutinaForm.valid) {
    // Estructuramos el objeto para que coincida con el @RequestBody Map de Java
    const payload = {
      usuarioId: this.usuarioId,
      nombreEntrenador: this.rutinaForm.value.nombreEntrenador,
      observaciones: "Rutina asignada por el coach", // O agrega un campo en el form
      detalles: this.rutinaForm.value.detalles
    };

    this.rutinaService.guardarRutina(payload).subscribe({
      next: () => {
        alert('✅ ¡Wansd System actualizó la rutina con éxito!');
        this.router.navigate(['/entrenador/lista-usuarios']);
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error al guardar. Revisa que el usuario no tenga ya una rutina (403/500).');
      }
    });
  }
}
}
