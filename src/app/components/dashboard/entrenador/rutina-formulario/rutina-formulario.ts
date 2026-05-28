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
      // 🔥 Sincronizado con el Regex de Java para Series
      seriesReps: [datos?.seriesReps || '', [
        Validators.required,
        Validators.pattern('^[0-9]{1,2} ?x ?[0-9]{1,3}$')
      ]],
      // 🔥 Sincronizado con el Regex de Java para Descanso (acepta la barra /)
      descanso: [datos?.descanso || '', [
        Validators.required,
        Validators.pattern('^[0-9]{1,3} ?(seg|s|min)( ?/ ?[0-9]{1,3} ?(seg|s|min))?$')
      ]],
      dias: [datos?.dias || '', Validators.required]
    });
    this.listaEjercicios.push(ejercicioGroup);
  }

  eliminarEjercicio(index: number) {
    this.listaEjercicios.removeAt(index);
  }

  onSubmit() {
    // 🛡️ EL ESCUDO: Validación en frontend antes de molestar a Java
    if (this.rutinaForm.invalid) {
      // Pone los inputs en rojo si tienes el CSS configurado
      this.rutinaForm.markAllAsTouched();

      // La alerta precisa para educar al entrenador
      alert("⚠️ ¡Alto ahí! Hay errores en los datos ingresados.\n\n" +
            "Por favor revisa que:\n" +
            "- Ningún campo esté vacío.\n" +
            "- Series / Reps tenga el formato: 4x12 o 4 x 12\n" +
            "- Descanso tenga el formato: 60s, 90 seg, o 60s / 90s");

      return; // 🛑 Abortamos la petición, evitamos el error 500
    }

    // Estructuramos el objeto para que coincida con el @RequestBody Map de Java
    const payload = {
      usuarioId: this.usuarioId,
      nombreEntrenador: this.rutinaForm.value.nombreEntrenador,
      observaciones: "Rutina asignada por el coach",
      detalles: this.rutinaForm.value.detalles
    };

    this.rutinaService.guardarRutina(payload).subscribe({
      next: () => {
        alert('✅ ¡Sistema Fortagym actualizó la rutina con éxito!');
        this.router.navigate(['/entrenador/lista-usuarios']);
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error interno del servidor. Revisa los logs de Spring Boot.');
      }
    });
  }
}
