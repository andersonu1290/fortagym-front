import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'] // 👈 Ojo: Angular 17+ a veces usa styleUrl (sin la 's'), verifica tu versión
})
export class Login {
  credentials = { email: '', password: '' };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    // 1. Intentamos iniciar sesión
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        // 2. Guardamos el Token de Wansd System
        this.authService.saveToken(response.token);

        // 3. Pedimos el perfil completo para saber el ROL
        this.authService.getPerfil().subscribe({
          next: (perfil) => {

            // 4. Redirigimos inteligentemente según el rol en la base de datos
            if (perfil.rol === 'ADMIN') {
              this.router.navigate(['/admin/dashboard']);
            }
            else if (perfil.rol === 'ENTRENADOR') {
              this.router.navigate(['/entrenador/dashboard']);
            }
            else if (perfil.rol === 'NUTRICIONISTA') {
              this.router.navigate(['/nutricion/dashboard']);
            }
            else {
              this.router.navigate(['/']); // Redirección para clientes normales
            }

          },
          error: (errPerfil) => {
            console.error('Error al obtener el perfil', errPerfil);
            this.router.navigate(['/']);
          }
        });
      },
      error: (err) => {
        // Si Spring Boot responde con error 401
        this.errorMessage = '❌ Credenciales incorrectas. Inténtalo de nuevo.';
      }
    });
  }
}
