import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RutinaService } from '../../../../services/rutina.service'; // Ajusta la ruta de los ../
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-rutina-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rutina-usuarios.html',
  styleUrl: './rutina-usuarios.scss'
})
export class RutinaUsuarios implements OnInit {
  usuarios: any[] = [];

  // URL expuesta directamente para tu archivo HTML
  apiUrl: string = environment.apiUrl;

  constructor(private rutinaService: RutinaService, private router: Router) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.rutinaService.getUsuariosEstado().subscribe({
      next: (data) => {
        this.usuarios = data;
        // 🔍 IMPRESIÓN EN CONSOLA: Abre F12 para ver si tu backend devuelve "dni" u otro nombre de campo
        console.log('Pacientes deportivos traídos del backend:', data);
      },
      error: (err) => console.error('Error cargando la lista', err)
    });
  }

  // Redirige al formulario de creación/edición de rutina
  irAFormulario(usuarioId: number) {
    this.router.navigate(['/entrenador/rutina-nueva', usuarioId]);
  }

  // ══════════════════════════════════════════════════════════
  //  MÉTODOS DE CONTEO PARA LAS MÉTRICAS DE ENCABEZADO
  // ══════════════════════════════════════════════════════════

  // Cuenta cuántos usuarios ya tienen una rutina establecida
  get totalAsignados(): number {
    return this.usuarios.filter((u: any) => u.tieneRutina === true).length;
  }

  // Cuenta cuántos usuarios están en estado de espera (Pendientes)
  get totalNoAsignados(): number {
    return this.usuarios.filter((u: any) => u.tieneRutina === false).length;
  }

  // ══════════════════════════════════════════════════════════
  //  MÉTODOS — UI Premium y Soporte de Avatares Inteligentes
  // ══════════════════════════════════════════════════════════

  // Extrae y une las iniciales correctas del cliente de forma segura
  iniciales(u: any): string {
    if (!u || !u.nombre) return '??';

    // Unimos nombre y apellido para asegurar capturar ambos componentes si existen
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

  // Asigna de forma cíclica y reactiva un color premium usando el ID del usuario
  avatarClass(u: any): string {
    const id = u.id || 0;
    const clases = ['av-orange', 'av-dark', 'av-blue', 'av-green', 'av-red'];
    return clases[id % clases.length];
  }

  // Oculta dinámicamente la etiqueta de imagen si responde un error HTTP (como 404)
  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
