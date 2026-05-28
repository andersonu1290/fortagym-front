import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../../../services/producto.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.scss']
})
export class ProductosAdmin implements OnInit {

  productos: any[] = [];
  productosFiltrados: any[] = [];

  // ── Variables de Formulario ──────────────────────────────
  archivoSeleccionado: File | null = null;
  filtroCategoria: string = 'Todos';
  textoBusqueda: string = '';
  modoSubida: string = 'archivo'; // 'archivo' o 'url'

  metricas = { total: 0, agotados: 0, valor: 0, categorias: 0, enStock: 0 };

  productoActual: any = {
    id: null,
    nombre: '',
    categoria: 'SUPLEMENTOS',
    precio: null,
    stock: null,
    descripcion: '',
    img: ''
  };

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.aplicarFiltros();
        this.calcularMetricas();
      },
      error: (err) => console.error("Error cargando productos", err)
    });
  }

  calcularMetricas() {
    this.metricas.total = this.productos.length;
    this.metricas.agotados = this.productos.filter(p => p.stock === 0).length;
    this.metricas.enStock = this.productos.filter(p => p.stock > 0).length;
    this.metricas.valor = this.productos.reduce((acc, p) => acc + (p.precio * p.stock), 0);

    const categoriasUnicas = new Set(this.productos.map(p => p.categoria));
    this.metricas.categorias = categoriasUnicas.size;
  }

  seleccionarCategoria(categoria: string) {
    this.filtroCategoria = categoria;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let temp = this.productos;
    if (this.filtroCategoria !== 'Todos') {
      temp = temp.filter(p => p.categoria.toUpperCase() === this.filtroCategoria.toUpperCase());
    }
    if (this.textoBusqueda.trim() !== '') {
      const termino = this.textoBusqueda.toLowerCase();
      temp = temp.filter(p => p.nombre.toLowerCase().includes(termino) || p.descripcion.toLowerCase().includes(termino));
    }
    this.productosFiltrados = temp;
  }

  onFileSelected(event: Event) {
    const el = event.target as HTMLInputElement;
    this.archivoSeleccionado = el.files?.[0] ?? null;
  }

  guardarProducto() {
    if (!this.productoActual.nombre || this.productoActual.precio == null || this.productoActual.stock == null) {
      alert("Por favor llena los campos obligatorios (Nombre, Precio y Stock)");
      return;
    }

    const formData = new FormData();

    if (this.productoActual.id) {
      formData.append('id', this.productoActual.id.toString());
    }

    formData.append('nombre', this.productoActual.nombre);
    formData.append('categoria', this.productoActual.categoria);
    formData.append('precio', this.productoActual.precio.toString());
    formData.append('stock', this.productoActual.stock.toString());
    formData.append('descripcion', this.productoActual.descripcion);

    // ── Lógica de imagen según modo seleccionado ────────────
    if (this.modoSubida === 'archivo' && this.archivoSeleccionado) {
      formData.append('file', this.archivoSeleccionado);
    } else if (this.modoSubida === 'url' && this.productoActual.img) {
      formData.append('img', this.productoActual.img);
    }

    this.productoService.guardarProducto(formData).subscribe({
      next: () => {
        alert("✅ Producto guardado exitosamente");
        this.limpiarFormulario();
        this.cargarProductos();
      },
      error: (err) => {
        console.error("Error al guardar:", err);
        alert("❌ Error al guardar el producto. Revisa la consola.");
      }
    });
  }

  editarProducto(producto: any) {
    this.productoActual = { ...producto };
    this.modoSubida = (producto.img && producto.img.startsWith('http')) ? 'url' : 'archivo';
    this.archivoSeleccionado = null;

    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  eliminarProducto(id: number) {
    if(confirm("¿Estás seguro de que deseas eliminar este producto de forma permanente?")) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          alert("🗑️ Producto eliminado correctamente");
          this.cargarProductos();
        },
        error: (err) => console.error("Error al eliminar", err)
      });
    }
  }

  limpiarFormulario() {
    this.productoActual = { id: null, nombre: '', categoria: 'SUPLEMENTOS', precio: null, stock: null, descripcion: '', img: '' };
    this.archivoSeleccionado = null;
    this.modoSubida = 'archivo';
  }

  // Función inteligente vinculada a tu variable environment.apiUrl
  getImagenUrl(img: string): string {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/uploads/')) return `${environment.apiUrl}${img}`;
    return `${environment.apiUrl}/uploads/${img}`;
  }
}
