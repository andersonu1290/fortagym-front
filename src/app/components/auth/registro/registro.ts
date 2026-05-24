import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class Registro {
  usuario = {
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'USUARIO' // Por defecto, se registran como clientes
  };
  mensajeError = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.registrar(this.usuario).subscribe({
      next: () => {
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.mensajeError = err.error?.error || 'Error al registrar usuario.';
      }
    });
  }
}
