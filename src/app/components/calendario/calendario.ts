import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // 🔥 Necesario para conectar con el Backend
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './calendario.html',
  styleUrl: './calendario.scss'
})
export class Calendario implements OnInit {
  // Estado de Sesión para el Navbar
  isLoggedIn: boolean = false;
  nombreUsuario: string = '';
  fotoPreviewUrl: string = 'assets/img/user-icon.png';
  rutaPanel: string = '/';
  menuAbierto: boolean = false;

  // URL expuesta directamente para tu archivo HTML por si la necesitas
  apiUrl: string = environment.apiUrl;

  // Lógica del Calendario Dinámico
  mesActual: Date = new Date();
  diasSemana: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  diasDelMes: any[] = [];

  // 🌟 Esta lista se llena con los eventos reales de la tabla 'eventos_calendario'
  eventosBD: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient // 🔥 Inyectamos HttpClient para traer datos reales
  ) {}

  ngOnInit() {
    this.verificarSesion();
    this.cargarEventosDesdeBD(); // 🔥 Llamamos a la base de datos al iniciar
  }

  // 📡 Carga los eventos reales desde el puerto 8090
  cargarEventosDesdeBD() {
    // 🔄 CORREGIDO: Se cambiaron las comillas simples por backticks ` y se inyectó api/ correctamente sin romper la ruta
    this.http.get<any[]>(`${environment.apiUrl}/api/calendario/mis-eventos`).subscribe({
      next: (data) => {
        console.log("📅 Eventos recibidos:", data); // Debug para ver los datos en consola
        this.eventosBD = data;
        this.generarCalendario(); // 🔄 Volvemos a generar el calendario con los datos recibidos
      },
      error: (err) => {
        console.error("Error al cargar eventos reales de FortaGym", err);
        this.generarCalendario(); // Generamos el calendario aunque esté vacío para no romper la vista
      }
    });
  }

  // 🔐 Verifica si hay sesión activa para el Navbar
  verificarSesion() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.authService.getPerfil().subscribe({
        next: (data: any) => {
          this.nombreUsuario = data.nombre;
          // Cargamos la foto desde el servidor con un timestamp para evitar la caché
          // 🔄 CORREGIDO: Se usaron backticks ` y se inyectó api/ correctamente respetando tu url
          this.fotoPreviewUrl = `${environment.apiUrl}/api/usuarios/foto/${data.id}?t=${Date.now()}`;

          // Determinamos el panel según el Rol en la DB
          if (data.rol === 'ADMIN') this.rutaPanel = '/admin/dashboard';
          else if (data.rol === 'ENTRENADOR') this.rutaPanel = '/entrenador/dashboard';
          else if (data.rol === 'NUTRICIONISTA') this.rutaPanel = '/nutricion/dashboard';
          else this.rutaPanel = '/usuario';
        },
        error: () => this.isLoggedIn = false
      });
    }
  }

  // 🗓️ Construcción de la matriz del calendario
  generarCalendario() {
    const year = this.mesActual.getFullYear();
    const month = this.mesActual.getMonth();

    const tempDate = new Date(year, month, 1);
    const primerDia = tempDate.getDay();
    const diasEnMes = new Date(year, month + 1, 0).getDate();

    // Ajuste para que la semana empiece en Lunes (L=0, M=1... D=6)
    const offset = primerDia === 0 ? 6 : primerDia - 1;

    this.diasDelMes = [];

    // 1. Espacios vacíos para cuadrar el inicio de semana
    for (let i = 0; i < offset; i++) {
      this.diasDelMes.push({ vacio: true });
    }

    // 2. Días reales del mes con búsqueda de eventos
    for (let i = 1; i <= diasEnMes; i++) {
      const mesFmt = String(month + 1).padStart(2, '0');
      const diaFmt = String(i).padStart(2, '0');
      const fechaClave = `${year}-${mesFmt}-${diaFmt}`;

      // 🔍 Filtramos los eventos que coincidan con este día (YYYY-MM-DD)
      const eventosDia = this.eventosBD.filter(e => e.fecha === fechaClave);

      this.diasDelMes.push({
        vacio: false,
        numero: i,
        eventos: eventosDia
      });
    }
  }

  // 🖱️ Navegación entre meses
  cambiarMes(direccion: number) {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + direccion, 1);
    this.cargarEventosDesdeBD(); // 🔄 Recargamos eventos al cambiar de mes
  }

  // 👤 Lógica del Menú de Usuario
  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
