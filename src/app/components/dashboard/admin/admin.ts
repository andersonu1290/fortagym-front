import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // 👈 Necesario para el routerLink
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements OnInit {
  nombreUsuario: string = 'Cargando...';
  menuAbierto: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Cuando carga el dashboard, pedimos el perfil para poner el nombre arriba
    this.authService.getPerfil().subscribe({
      next: (perfil) => {
        this.nombreUsuario = perfil.nombre;
      },
      error: () => {
        this.nombreUsuario = 'Admin';
      }
    });
  }

  // Lógica para abrir/cerrar el menú (reemplaza tu viejo <script>)
  toggleMenu(event: Event) {
    event.stopPropagation(); // Evita que el clic se propague al main
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
