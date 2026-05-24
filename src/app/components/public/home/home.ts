import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PromocionService } from '../../../services/promocion.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

export interface Sede {
  nombre: string;
  direccion: string;
  img: string;
  mapaUrl: SafeResourceUrl; // Necesario para iframes
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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

  // --- NUEVAS VARIABLES PARA SEDES ---
  busquedaSede: string = '';
  sedes: Sede[] = [];
  sedesFiltradas: Sede[] = [];
  modalSedeAbierto: boolean = false;
  sedeSeleccionada: Sede | null = null;

  constructor(
    private promoService: PromocionService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
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

    // 3. Inicialización de Sedes y Mapas
    this.sedes = [
      {
        nombre: 'Sede Puente Piedra',
        direccion: 'Av. Puente Piedra 1126 (Paradero Norteño).',
        img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600',
        mapaUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3904.700779812776!2d-77.0848086!3d-11.856205899999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105d6b72ad5082f%3A0xe35027252199156b!2sForta%20Gym%20-%20Sede%20Puente%20piedra!5e0!3m2!1ses-419!2spe!4v1779659516946!5m2!1ses-419!2spe')
      },
      {
        nombre: 'Sede Santa Clara',
        direccion: 'Multicentro Santa Clara, 3er nivel.',
        img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600',
        mapaUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.390564683328!2d-76.8848239!3d-12.0166106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c3c60ef3a8bf%3A0xd17c5fe6801b9251!2sFortes%20Gym!5e0!3m2!1ses-419!2spe!4v1779659627538!5m2!1ses-419!2spe')
      },
      {
        nombre: 'Sede Ventanilla',
        direccion: 'Mz. D Lt. 1, 2do piso, Villa Los Reyes 1era etapa, Ventanilla, Callao.',
        img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600',
        mapaUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62477.680603173576!2d-77.19821135569511!3d-11.845419105307851!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105d436cedfc4c3%3A0xb7bdf19224dfa9b1!2sForta%20Gym%20Ventanilla!5e0!3m2!1ses-419!2spe!4v1779659909829!5m2!1ses-419!2spe')
      }
    ];
  }

  /* =========================================
     LÓGICA DE SEDES (Buscador y Modales)
     ========================================= */
  buscarSedes(): void {
    const texto = this.busquedaSede.trim().toLowerCase();
    if (texto === '') {
      this.sedesFiltradas = [];
      return;
    }
    this.sedesFiltradas = this.sedes.filter(sede =>
      sede.nombre.toLowerCase().includes(texto) ||
      sede.direccion.toLowerCase().includes(texto)
    );
  }

  abrirModalSede(sede: Sede): void {
    this.sedeSeleccionada = sede;
    this.modalSedeAbierto = true;
    this.sedesFiltradas = []; // Ocultar el dropdown al seleccionar
    this.busquedaSede = ''; // Limpiar buscador
  }

  cerrarModalSede(): void {
    this.modalSedeAbierto = false;
    setTimeout(() => this.sedeSeleccionada = null, 300); // Retardo para suavizar el cierre
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

  irABuscar() {
    const elemento = document.getElementById('buscar-sede');
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

}
