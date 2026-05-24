import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface ProductoCarrito {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  img: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private carrito: ProductoCarrito[] = [];
  private readonly STORAGE_KEY = 'fortagym_cart';
  private apiUrl = `${environment.apiUrl}/api/carrito`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.inicializarCarrito();
  }

  // ==========================================
  // 1. INICIALIZACIÓN INTELIGENTE
  // ==========================================
  inicializarCarrito(): void {
    if (this.authService.isLoggedIn()) {
      this.cargarDesdeBackend();
    } else {
      this.cargarDesdeLocalStorage();
    }
  }

  // ==========================================
  // 2. MODO INVITADO (LOCAL STORAGE)
  // ==========================================
  private cargarDesdeLocalStorage(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.carrito = JSON.parse(saved);
      } catch (e) {
        this.carrito = [];
      }
    }
  }

  private guardarEnLocalStorage(): void {
    if (!this.authService.isLoggedIn()) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.carrito));
    }
  }

  // ==========================================
  // 3. MODO LOGUEADO (BASE DE DATOS)
  // ==========================================
  private cargarDesdeBackend(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        // Mapeamos el JSON gigante de Spring Boot a nuestra interfaz limpia
        this.carrito = data.map(item => ({
          id: item.producto.id,
          nombre: item.producto.nombre,
          categoria: item.producto.categoria,
          descripcion: item.producto.descripcion || 'Sin descripción',
          precio: item.producto.precio,
          cantidad: item.cantidad,
          img: item.producto.img
        }));
      },
      error: (err) => console.error("Error al descargar carrito de BD:", err)
    });
  }

  // 🔥 LA MAGIA: Llama a esto desde tu Login Component al iniciar sesión
  sincronizarConBackend(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const localCart: ProductoCarrito[] = JSON.parse(saved);

        // Enviamos todo lo que curioseó como invitado hacia la Base de Datos
        localCart.forEach(item => {
          this.http.post(`${this.apiUrl}/add/${item.id}/${item.cantidad}`, {}, { responseType: 'text' }).subscribe();
        });

        // Limpiamos su navegador
        localStorage.removeItem(this.STORAGE_KEY);

        // Actualizamos la vista leyendo desde el backend después de medio segundo
        setTimeout(() => this.cargarDesdeBackend(), 500);

      } catch (e) {
        console.error("Error sincronizando", e);
      }
    } else {
      this.cargarDesdeBackend();
    }
  }

  // ==========================================
  // 4. MÉTODOS PÚBLICOS (UI)
  // ==========================================

  getCarrito(): ProductoCarrito[] {
    return this.carrito;
  }

  agregarProducto(producto: ProductoCarrito): void {
    // 1. Lo mostramos visualmente al instante (Optimistic UI)
    const existe = this.carrito.find(p => p.id === producto.id);
    if (existe) {
      existe.cantidad += producto.cantidad;
    } else {
      this.carrito.push(producto);
    }

    // 2. Persistencia en la sombra
    if (this.authService.isLoggedIn()) {
      this.http.post(`${this.apiUrl}/add/${producto.id}/${producto.cantidad}`, {}, { responseType: 'text' })
        .subscribe({ error: err => console.error("Fallo BD:", err) });
    } else {
      this.guardarEnLocalStorage();
    }
  }

  // 🛠️ Nuevo método necesario para los botones de (+) y (-)
  actualizarCantidadExacta(productoId: number, nuevaCantidad: number): void {
    const item = this.carrito.find(p => p.id === productoId);
    if (item) {
      item.cantidad = nuevaCantidad;

      if (this.authService.isLoggedIn()) {
        // Como el Backend suma siempre (no permite restar), el truco más elegante
        // para cambiar la cantidad exacta es eliminarlo y reinsertarlo.
        this.http.delete(`${this.apiUrl}/eliminar/${productoId}`, { responseType: 'text' }).subscribe(() => {
            this.http.post(`${this.apiUrl}/add/${productoId}/${nuevaCantidad}`, {}, { responseType: 'text' }).subscribe();
        });
      } else {
        this.guardarEnLocalStorage();
      }
    }
  }

  eliminarProducto(index: number): void {
    if (index > -1 && index < this.carrito.length) {
      const productoId = this.carrito[index].id;

      this.carrito.splice(index, 1);

      if (this.authService.isLoggedIn()) {
        this.http.delete(`${this.apiUrl}/eliminar/${productoId}`, { responseType: 'text' }).subscribe();
      } else {
        this.guardarEnLocalStorage();
      }
    }
  }

  limpiarCarrito(): void {
    this.carrito = [];
    if (this.authService.isLoggedIn()) {
      this.http.delete(`${this.apiUrl}/limpiar`, { responseType: 'text' }).subscribe();
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  getSubtotal(): number {
    return this.carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }
}
