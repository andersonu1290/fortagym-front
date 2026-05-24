import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sobre-nosotros',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sobre-nosotros.html',
  styleUrl: './sobre-nosotros.scss'
})
export class SobreNosotros implements OnInit {
  isLoggedIn: boolean = false;
  nombreUsuario: string = '';
  fotoPreviewUrl: string = 'assets/img/user-icon.png';
  rutaPanel: string = '/';
  menuAbierto: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // 1. Verificamos si hay un token válido
    this.isLoggedIn = this.authService.isLoggedIn(); // Asumiendo que tienes un método isLoggedIn en tu AuthService

    if (this.isLoggedIn) {
      // 2. Si está logueado, pedimos su perfil
      this.authService.getPerfil().subscribe({
        next: (data: any) => {
          this.nombreUsuario = data.nombre;

          // 3. Construimos la foto con su ID
          this.fotoPreviewUrl = `${environment.apiUrl}/api/usuarios/foto/${data.id}?t=${Date.now()}`;

          // 4. Calculamos a qué panel debe volver
          if (data.rol === 'ADMIN') this.rutaPanel = '/admin/dashboard';
          else if (data.rol === 'ENTRENADOR') this.rutaPanel = '/entrenador/dashboard';
          else if (data.rol === 'NUTRICIONISTA') this.rutaPanel = '/nutricion/dashboard';
          else this.rutaPanel = '/usuario';
        },
        error: () => {
          this.isLoggedIn = false; // Si falla, forzamos que se vea como no logueado
        }
      });
    }
  }

  // Métodos para el menú desplegable del usuario
  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  cerrarSesion() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
