import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './usuario.html',
  styleUrl: './usuario.scss'
})
export class Usuario implements OnInit {

  // ── Perfil ──────────────────────────────────────────
  perfil: any = { nombre: '', apellido: '', email: '', rol: 'usuario' };

  formDatos = {
    nombre: '',
    apellido: '',
    password: '',
    confirmPassword: ''
  };

  // ── Foto ─────────────────────────────────────────────
  fotoPreviewUrl: string = 'assets/img/user-icon.png';
  archivoFoto: File | null = null;

  // ── UI State ─────────────────────────────────────────
  activeTab: 'personal' | 'seguridad' = 'personal';
  imageMode: 'archivo' | 'url' = 'archivo';
  imagenUrl: string = '';

  // ── Toast ─────────────────────────────────────────────
  toast = {
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  // ── Carga de perfil ───────────────────────────────────
  cargarPerfil(): void {
    this.authService.getPerfil().subscribe({
      next: (data: any) => {
        this.perfil = data;
        this.formDatos.nombre   = data.nombre;
        this.formDatos.apellido = data.apellido;
        this.fotoPreviewUrl = `${environment.apiUrl}/api/usuarios/foto/${data.id}?t=${Date.now()}`;
      },
      error: () => {
        this.fotoPreviewUrl = 'assets/img/user-icon.png';
      }
    });
  }

  // ── Foto: selección de archivo ────────────────────────
  onFotoSeleccionada(event: any): void {
    const file: File | undefined = event.target?.files?.[0];
    if (!file) return;

    this.archivoFoto = file;
    const reader = new FileReader();
    reader.onload = (e: any) => { this.fotoPreviewUrl = e.target.result; };
    reader.readAsDataURL(file);
  }

  guardarFoto(): void {
    if (!this.archivoFoto) return;

    this.usuarioService.subirFoto(this.archivoFoto).subscribe({
      next: () => {
        this.mostrarToast('Foto actualizada correctamente', 'success');
        this.archivoFoto = null;
        this.cargarPerfil();
      },
      error: () => this.mostrarToast('Error al guardar la foto', 'error')
    });
  }

  // ── Foto: desde URL ───────────────────────────────────
  previsualizarUrl(): void {
    if (this.imagenUrl.trim()) {
      this.fotoPreviewUrl = this.imagenUrl.trim();
    }
  }

  aplicarUrlFoto(): void {
    const url = this.imagenUrl.trim();
    if (!url) return;

    this.fotoPreviewUrl = url;
    // TODO: Si el backend tiene un endpoint para guardar foto por URL, llamarlo aquí:
    // this.usuarioService.guardarFotoUrl(url).subscribe({ next: () => {...} });
    this.mostrarToast('Imagen aplicada desde URL', 'success');
    this.imagenUrl = '';
  }

  // ── Datos personales ──────────────────────────────────
  guardarInfoPersonal(): void {
    const payload = {
      nombre:   this.formDatos.nombre,
      apellido: this.formDatos.apellido
    };

    this.usuarioService.actualizarPerfil(payload).subscribe({
      next: () => {
        this.mostrarToast('Información personal actualizada', 'success');
        this.cargarPerfil();
      },
      error: () => this.mostrarToast('Error al actualizar la información', 'error')
    });
  }

  // ── Cambio de contraseña ──────────────────────────────
  cambiarPassword(): void {
    if (!this.formDatos.password) {
      this.mostrarToast('Ingresa una nueva contraseña', 'error');
      return;
    }
    if (this.formDatos.password !== this.formDatos.confirmPassword) {
      this.mostrarToast('Las contraseñas no coinciden', 'error');
      return;
    }

    this.usuarioService.actualizarPerfil({ password: this.formDatos.password }).subscribe({
      next: () => {
        this.mostrarToast('Contraseña actualizada correctamente', 'success');
        this.formDatos.password        = '';
        this.formDatos.confirmPassword = '';
      },
      error: () => this.mostrarToast('Error al cambiar la contraseña', 'error')
    });
  }

  // ── Navegación ────────────────────────────────────────
  irAHistorial(): void {
    this.router.navigate(['/historial-compras']);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // ── Toast helper ──────────────────────────────────────
  mostrarToast(message: string, type: 'success' | 'error'): void {
    this.toast = { visible: true, message, type };
    setTimeout(() => { this.toast.visible = false; }, 3500);
  }
}
