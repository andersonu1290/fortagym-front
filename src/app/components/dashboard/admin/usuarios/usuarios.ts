import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../services/admin.service';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss'
})
export class Usuarios implements OnInit {

  listaUsuarios: any[] = [];

  // ── Búsqueda y filtros ─────────────────────────────────────
  busqueda    = '';
  filtroActivo = 'todos';

  // URL expuesta directamente para tu archivo HTML
  apiUrl: string = environment.apiUrl;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  // ── Carga de datos (sin cambios) ───────────────────────────
  cargarUsuarios() {
    this.adminService.getUsuarios().subscribe({
      next: (data) => this.listaUsuarios = data,
      error: (err) => console.error('Error al traer usuarios', err)
    });
  }

  // ── Cambiar rol (sin cambios, solo se ajustan los valores
  //    al formato minúscula que devuelve tu backend) ──────────
  cambiarRol(id: number, rolSeleccionado: string) {
      // Convertimos a mayúsculas para que el backend lo mapee correctamente con el Enum de Java
      const rolFinal = (rolSeleccionado === 'cliente' ? 'usuario' : rolSeleccionado).toUpperCase();
      this.adminService.actualizarRol(id, rolFinal).subscribe({
          next: () => {
              alert(`Rol actualizado a ${rolFinal} con éxito`);
              this.cargarUsuarios();
          },
          error: (err) => {
              console.error('Error al actualizar rol', err);
              alert('No se pudo actualizar el rol');
          }
      });
  }

  // ── Eliminar usuario (sin cambios) ─────────────────────────
  borrarUsuario(id: number) {
    if (confirm('¿Estás seguro de eliminar este usuario de FortaGym?')) {
      this.adminService.eliminarUsuario(id).subscribe({
        next: () => this.cargarUsuarios()
      });
    }
  }

  // ══════════════════════════════════════════════════════════
  //  MÉTODOS NUEVOS — UI premium
  // ══════════════════════════════════════════════════════════

  // Filtra la lista según búsqueda + tab activo
  usuariosFiltrados(): any[] {
    const q = this.busqueda.toLowerCase().trim();

    return this.listaUsuarios.filter(u => {
      const coincideBusqueda =
        !q ||
        u.nombre?.toLowerCase().includes(q)   ||
        u.apellido?.toLowerCase().includes(q)  ||
        u.email?.toLowerCase().includes(q)     ||
        u.dni?.toString().includes(q);

      const coincideFiltro =
        this.filtroActivo === 'todos'
          ? true
          : u.rol?.toLowerCase() === this.filtroActivo;

      return coincideBusqueda && coincideFiltro;
    });
  }

  // Cuenta usuarios de un rol específico para las métricas
  contarPorRol(rol: string): number {
    return this.listaUsuarios.filter(u => u.rol?.toLowerCase() === rol).length;
  }

  // Cambia el tab de filtro activo
  setFiltro(filtro: string): void {
    this.filtroActivo = filtro;
  }

  // 🚀 ACTUALIZADO: Iniciales con fallback robusto contra nombres compuestos y tipos estrictos
  iniciales(u: any): string {
    if (!u || !u.nombre) return '??';

    const nombreCompleto = `${u.nombre} ${u.apellido || ''}`.trim();

    if (nombreCompleto.includes(' ')) {
      const parts = nombreCompleto.split(' ');
      const palabrasValidas = parts.filter((p: string) => p.length > 0);

      if (palabrasValidas.length >= 2) {
        const primeraLetra = palabrasValidas[0].charAt(0);
        const segundaLetra = palabrasValidas[1].charAt(0);
        return (primeraLetra + segundaLetra).toUpperCase();
      }
    }

    return nombreCompleto.substring(0, 2).toUpperCase();
  }

  // 🚀 ACTUALIZADO: Maneja las clases de colores premium usando el ID del usuario
  avatarClass(u: any): string {
    const id = u.id || 0;
    const clases = ['av-orange', 'av-dark', 'av-blue', 'av-green', 'av-red'];
    return clases[id % clases.length];
  }

  // Etiqueta legible del rol en español
  rolLabel(rol: string): string {
    const labels: Record<string, string> = {
      usuario:       'Cliente',
      entrenador:    'Entrenador',
      nutricionista: 'Nutricionista',
      admin:         'Admin',
    };
    return labels[rol?.toLowerCase()] ?? rol;
  }

  // Clase del ícono FontAwesome según el rol
  badgeIcon(rol: string): string {
    const iconos: Record<string, string> = {
      usuario:       'fa-user',
      entrenador:    'fa-dumbbell',
      nutricionista: 'fa-apple-alt',
      admin:         'fa-shield-alt',
    };
    return iconos[rol?.toLowerCase()] ?? 'fa-user';
  }

  // Oculta la imagen si la URL falla (muestra las iniciales en su lugar)
  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
