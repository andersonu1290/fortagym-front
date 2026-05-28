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
  perfil: any = { nombre: '', apellido: '', email: '' };
  formDatos = { nombre: '', apellido: '', password: '', confirmPassword: '' };

  fotoPreviewUrl: any = 'assets/img/user-icon.png';
  archivoFoto: File | null = null;
  rutaPanel: string = '/';

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarPerfil();
  }

cargarPerfil() {
  this.authService.getPerfil().subscribe({
    next: (data: any) => {
      this.perfil = data;
      this.formDatos.nombre = data.nombre;
      this.formDatos.apellido = data.apellido;

      // 🖼️ SOLUCIÓN: Construimos la URL usando el ID real del usuario
      // Si el usuario existe, apuntamos al endpoint de bytes del backend
      this.fotoPreviewUrl = `${environment.apiUrl}/api/usuarios/foto/${data.id}?t=${Date.now()}`;
    },
    error: (err) => {
      console.error("Error al conectar con el servidor 8090", err);
      // Fallback si el servidor está caído
      this.fotoPreviewUrl = 'assets/img/user-icon.png';
    }
  });
}

onFotoSeleccionada(event: any) {
  const input = event.target as HTMLInputElement;

  if (input && input.files && input.files.length > 0) {

    const archivoManual = input.files[0]; // 👈 ESTA ES LA CORRECTA

    this.archivoFoto = archivoManual;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fotoPreviewUrl = e.target.result;
    };

    reader.readAsDataURL(archivoManual);
  }
}

  guardarFoto() {
  if (!this.archivoFoto) return;
  this.usuarioService.subirFoto(this.archivoFoto).subscribe({
    next: () => {
      alert('✅ Foto guardada en Sistema Fortagym');
      this.cargarPerfil(); // Recarga para refrescar la URL con el nuevo timestamp
    }
  });
}

  guardarDatos() {
    if (this.formDatos.password && this.formDatos.password !== this.formDatos.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    this.usuarioService.actualizarPerfil(this.formDatos).subscribe({
      next: () => alert('✅ Información actualizada'),
      error: () => alert('❌ Error al actualizar datos')
    });
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
