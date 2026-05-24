import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PromocionService } from '../../../services/promocion.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  promocionesActivas: any[] = [];
  usuarioLogueado: boolean = false;
  rutaPanel: string = '/login';

  // URL expuesta directamente para tu archivo HTML
  apiUrl: string = environment.apiUrl;

  /* =========================================
     TABS PROFESIONALES
     ========================================= */
  activeTab: string = 'entrenadores';

  /* =========================================
     MODAL HORARIOS (Original)
     ========================================= */
  modalAbierto = false;
  profesionalSeleccionado = '';

  /* =========================================
     🆕 MODAL PROMOCIONES (Nuevas variables separadas)
     ========================================= */
  promoModalAbierto: boolean = false;
  promoSeleccionada: any = null;

  constructor(
    private promoService: PromocionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // 1. Verificación de Sesión y Rol (Intacto)
    if (this.authService.getToken()) {
      this.usuarioLogueado = true;
      this.authService.getPerfil().subscribe({
        next: (perfil) => {
          if (perfil.rol === 'ADMIN') {
            this.rutaPanel = '/admin/dashboard';
          }
          else if (perfil.rol === 'ENTRENADOR') {
            this.rutaPanel = '/entrenador/dashboard';
          }
          else if (perfil.rol === 'NUTRICIONISTA') {
            this.rutaPanel = '/nutricion/dashboard';
          }
          else {
            this.rutaPanel = '/usuario';
          }
        },
        error: () => {
          this.usuarioLogueado = false;
        }
      });
    }

    // 2. Carga de Promociones (Intacto)
    this.promoService.getPromociones().subscribe({
      next: (data) => {
        this.promocionesActivas = data;
      },
      error: (err) => {
        console.error('Error al cargar promociones', err);
      }
    });
  }

  /* =========================================
     ABRIR MODAL HORARIOS (Original)
     ========================================= */
  abrirModal(nombre: string) {
    this.profesionalSeleccionado = nombre;
    this.modalAbierto = true;
  }

  /* =========================================
     CERRAR MODAL HORARIOS (Original)
     ========================================= */
  cerrarModal() {
    this.modalAbierto = false;
  }

  /* =========================================
     🆕 CONTROL MODAL PROMOCIONES
     ========================================= */
  abrirModalPromo(promocion: any) {
    this.promoSeleccionada = promocion;
    this.promoModalAbierto = true;
  }

  cerrarModalPromo() {
    this.promoModalAbierto = false;
    this.promoSeleccionada = null;
  }

  cerrarSesion() {
    this.authService.logout();
    this.usuarioLogueado = false;
    this.rutaPanel = '/login';
    window.location.reload();
  }
}
