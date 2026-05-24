import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NutricionService } from '../../../services/nutricion.service';
import { environment } from '../../../../environments/environment';

// 🚀 PIPE RÁPIDO PARA CONTAR PACIENTES PENDIENTES EN EL HTML
@Pipe({
  name: 'filterPendientes',
  standalone: true
})
export class FilterPendientesPipe implements PipeTransform {
  transform(usuarios: any[]): any[] {
    if (!usuarios) return [];
    return usuarios.filter(u => u.tieneNutricion === false);
  }
}

@Component({
  selector: 'app-nutricionista',
  standalone: true,
  imports: [CommonModule, RouterModule, FilterPendientesPipe], // Agregado el Pipe
  templateUrl: './nutricionista.html',
  styleUrl: './nutricionista.scss'
})
export class Nutricionista implements OnInit {
  nombreUsuario: string = 'Cargando...';
  menuAbierto: boolean = false;
  usuarios: any[] = [];

  // URL expuesta directamente para tu archivo HTML
  apiUrl: string = environment.apiUrl;

  constructor(
    private authService: AuthService,
    private nutricionService: NutricionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getPerfil().subscribe({
      next: (perfil) => this.nombreUsuario = perfil.nombre,
      error: () => this.nombreUsuario = 'Nutricionista'
    });

    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.nutricionService.getUsuariosEstado().subscribe({
      next: (data) => this.usuarios = data,
      error: (err) => console.error('Error al cargar pacientes', err)
    });
  }

  evaluar(usuarioId: number) {
    this.router.navigate(['/nutricion/evaluar', usuarioId]);
  }

  // 🚀 NUEVO: Helpers para la UI Premium (Avatares)
  iniciales(u: any): string {
    if (!u || !u.nombre) return '??';

    const nombre = u.nombre.trim();

    // Si contiene espacios, separamos las palabras (Nombre Apellido)
    if (nombre.includes(' ')) {
      const parts = nombre.split(' ');
      // 🚀 Corregido agregando : string al parámetro 'p' para evitar el error del linter
      const palabrasValidas = parts.filter((p: string) => p.length > 0);

      if (palabrasValidas.length >= 2) {
        const primeraLetra = palabrasValidas[0].charAt(0);
        const segundaLetra = palabrasValidas[1].charAt(0);
        return (primeraLetra + segundaLetra).toUpperCase();
      }
    }

    // Si es una sola palabra, tomamos las dos primeras letras
    return nombre.substring(0, 2).toUpperCase();
  }

  avatarClass(u: any): string {
    const id = u.id || 0;
    const clases = ['av-1', 'av-2', 'av-3'];
    return clases[id % clases.length];
  }

  // Controles de Menú
  toggleMenu(event: Event) {
    event.stopPropagation();
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
