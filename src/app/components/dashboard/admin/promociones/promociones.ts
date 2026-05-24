import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PromocionService } from '../../../../services/promocion.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './promociones.html',
  styleUrl: './promociones.scss'
})
export class Promociones implements OnInit {

  listaPromociones: any[] = [];

  // ── Variables del formulario ───────────────────────────────
  nuevoNombre       = '';
  nuevoTitulo       = '';
  nuevaDescripcion  = '';
  modoSubida        = 'archivo';
  archivoSeleccionado: File | null = null;
  nuevaUrl          = '';

  // ── Variables para modo edición ───────────────────────────
  enModoEdicion              = false;
  idPromocionSeleccionada: number | null = null;

  // ── NUEVO: URL de preview para mostrar imagen actual en edición
  previewUrl = '';

  // URL expuesta directamente para tu archivo HTML y lógica interna
  apiUrl: string = environment.apiUrl;

  constructor(private promoService: PromocionService) {}

  ngOnInit() {
    this.cargarPromociones();
  }

  // ── Carga (sin cambios) ────────────────────────────────────
  cargarPromociones() {
    this.promoService.getPromociones().subscribe(data => this.listaPromociones = data);
  }

  // ── Selección de archivo (sin cambios) ────────────────────
  onFileSelected(event: Event) {
    const el = event.target as HTMLInputElement;
    this.archivoSeleccionado = el.files?.[0] ?? null;
  }

  // ── Subir / Editar (sin cambios) ──────────────────────────
  subir() {
    if (!this.nuevoNombre) {
      alert('Por favor, ingresa el nombre identificador de la promoción.');
      return;
    }
    if (!this.nuevoTitulo) {
      alert('Por favor, ingresa el título llamativo de la promoción.');
      return;
    }
    if (!this.nuevaDescripcion) {
      alert('Por favor, ingresa una descripción para los detalles de la promoción.');
      return;
    }
    if (!this.enModoEdicion) {
      if (this.modoSubida === 'archivo' && !this.archivoSeleccionado) {
        alert('Por favor, selecciona una imagen de tu computadora.');
        return;
      }
      if (this.modoSubida === 'url' && !this.nuevaUrl) {
        alert('Por favor, ingresa un link de imagen válido.');
        return;
      }
    }

    if (this.enModoEdicion && this.idPromocionSeleccionada !== null) {
      this.promoService.editarPromocion(
        this.idPromocionSeleccionada,
        this.nuevoNombre,
        this.nuevoTitulo,
        this.nuevaDescripcion,
        this.archivoSeleccionado,
        this.nuevaUrl
      ).subscribe({
        next: () => {
          alert('🔄 Promoción actualizada con éxito');
          this.cancelarEdicion();
          this.cargarPromociones();
        },
        error: (err) => {
          console.error('Error al editar:', err);
          alert('❌ Hubo un problema al actualizar la promoción.');
        }
      });

    } else {
      this.promoService.subirPromocion(
        this.nuevoNombre,
        this.nuevoTitulo,
        this.nuevaDescripcion,
        this.archivoSeleccionado,
        this.nuevaUrl
      ).subscribe({
        next: () => {
          alert('✅ Promoción publicada con éxito');
          this.limpiarFormulario();
          this.cargarPromociones();
        },
        error: (err) => {
          console.error('Error al subir:', err);
          alert('❌ Hubo un problema al subir la promoción.');
        }
      });
    }
  }

  // ── Seleccionar para editar ────────────────────────────────
  seleccionarParaEditar(promocion: any) {
    this.enModoEdicion              = true;
    this.idPromocionSeleccionada    = promocion.id;
    this.nuevoNombre                = promocion.nombre;
    this.nuevoTitulo                = promocion.titulo;
    this.nuevaDescripcion           = promocion.descripcion;
    this.archivoSeleccionado        = null;

    if (promocion.imagen?.startsWith('http')) {
      this.modoSubida  = 'url';
      this.nuevaUrl    = promocion.imagen;
      this.previewUrl  = promocion.imagen;
    } else {
      this.modoSubida  = 'archivo';
      this.nuevaUrl    = '';

      // 🔄 CORREGIDO: Eliminamos la barra al final de la apiUrl antes de concatenar con la ruta del backend
      const urlLimpia = this.apiUrl.replace(/\/$/, '');
      this.previewUrl = promocion.imagen
        ? `${urlLimpia}${promocion.imagen}`
        : '';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Cancelar edición (sin cambios) ────────────────────────
  cancelarEdicion() {
    this.enModoEdicion           = false;
    this.idPromocionSeleccionada = null;
    this.previewUrl              = '';
    this.limpiarFormulario();
  }

  // ── Borrar (sin cambios) ───────────────────────────────────
  borrar(id: number) {
    if (confirm('¿Deseas eliminar esta promoción definitivamente?')) {
      this.promoService.eliminarPromocion(id).subscribe(() => this.cargarPromociones());
    }
  }

  // ── Helper: limpia el formulario ──────────────────────────
  private limpiarFormulario() {
    this.nuevoNombre        = '';
    this.nuevoTitulo        = '';
    this.nuevaDescripcion   = '';
    this.nuevaUrl           = '';
    this.archivoSeleccionado = null;
    this.modoSubida         = 'archivo';
  }
}
