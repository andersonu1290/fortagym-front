import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { environment } from '../../../environments/environment';
import { CartService, ProductoCarrito } from '../../services/cart.service'; // Importa tu servicio

export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  descripcion?: string;
  img?: string;
}

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tienda.html',
  styleUrl: './tienda.scss'
})
export class TiendaComponent implements OnInit {

  // Usamos la URL base del entorno para evitar errores de conexión
  private readonly IMG_BASE = environment.apiUrl;

  // Estado
  listaProductos: Producto[] = [];
  busqueda = '';
  categoriaActiva = 'todos';
  ordenActivo = 'default';
  productoModal: Producto | null = null;
  categorias: string[] = [];

  constructor(
    private productoService: ProductoService,
    private cartService: CartService // Inyectamos el servicio
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  // ── Carga de datos ─────────────
  cargarProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.listaProductos = data;
        this.extraerCategorias();
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  private extraerCategorias(): void {
    const set = new Set(this.listaProductos.map(p => p.categoria));
    this.categorias = Array.from(set).sort();
  }

  // ── Lógica del Carrito ─────────────────────────────────────
  agregarAlCarrito(prod: Producto): void {

    console.log('Intento de agregar:', prod); // <--- ESTO ES VITAL: Si esto no sale en consola al hacer clic, es un tema de CSS.

    if (!prod) {
        console.error('Producto nulo');
        return;
    }
    // Mapeamos el producto de la tienda a la interfaz ProductoCarrito del CartService
    const item: ProductoCarrito = {
      id: prod.id,
      nombre: prod.nombre,
      categoria: prod.categoria,
      descripcion: prod.descripcion || 'Sin descripción',
      precio: prod.precio,
      cantidad: 1, // Por defecto agregamos 1
      img: prod.img || ''
    };

    this.cartService.agregarProducto(item);
    this.cerrarModal();
    alert(`¡${prod.nombre} agregado al carrito!`);
  }

  // ── Filtrado y Ordenamiento ────────────────────────────────
  productosFiltrados(): Producto[] {
    const q = this.busqueda.toLowerCase().trim();

    let resultado = this.listaProductos.filter(p => {
      const coincideBusqueda =
        !q ||
        p.nombre.toLowerCase().includes(q)       ||
        p.categoria.toLowerCase().includes(q)    ||
        p.descripcion?.toLowerCase().includes(q);

      const coincideCategoria =
        this.categoriaActiva === 'todos' ||
        p.categoria === this.categoriaActiva;

      return coincideBusqueda && coincideCategoria;
    });

    return this.aplicarOrden(resultado);
  }

  private aplicarOrden(lista: Producto[]): Producto[] {
    const copia = [...lista];
    switch (this.ordenActivo) {
      case 'precio-asc':  return copia.sort((a, b) => a.precio - b.precio);
      case 'precio-desc': return copia.sort((a, b) => b.precio - a.precio);
      case 'nombre':      return copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'stock':       return copia.sort((a, b) => b.stock - a.stock);
      default:            return copia;
    }
  }

  // ── Helpers de UI ──────────────────────────────────────────
  contarEnStock(): number {
    return this.listaProductos.filter(p => p.stock > 0).length;
  }

  setCategoria(cat: string): void {
    this.categoriaActiva = cat;
  }

  ordenar(): void {}

  resetFiltros(): void {
    this.busqueda = '';
    this.categoriaActiva = 'todos';
    this.ordenActivo = 'default';
  }

  abrirModal(producto: Producto): void {
    this.productoModal = producto;
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    this.productoModal = null;
    document.body.style.overflow = '';
  }

  resolverImg(img?: string): string {
    if (!img) return 'https://via.placeholder.com/400x300?text=Sin+Imagen';
    if (img.startsWith('http')) return img;
    return `${this.IMG_BASE}${img}`;
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/400x300?text=Imagen+No+Disponible';
  }

  stockClass(stock: number): string {
    if (stock === 0)   return 'stock-out';
    if (stock <= 5)    return 'stock-low';
    return 'stock-ok';
  }

  stockLabel(stock: number): string {
    if (stock === 0)   return 'Sin stock';
    if (stock <= 5)    return `${stock} restantes`;
    return 'En stock';
  }

  iconoCategoria(cat: string): string {
    const map: Record<string, string> = {
      suplementos: 'fa-flask',
      ropa:        'fa-tshirt',
      accesorios:  'fa-wrench',
      equipos:     'fa-dumbbell'
    };
    return map[cat.toLowerCase()] ?? 'fa-tag';
  }
}
