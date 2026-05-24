import { Injectable } from '@angular/core';

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

  constructor() {
    // Al inicializar el servicio, cargamos lo que ya exista en el navegador
    this.cargarDesdeLocalStorage();
  }

  // Carga los datos guardados en el navegador
  private cargarDesdeLocalStorage(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.carrito = JSON.parse(saved);
      } catch (e) {
        console.error("Error al leer el carrito:", e);
        this.carrito = [];
      }
    }
  }

  // Guarda el estado actual en el navegador
  private guardarEnLocalStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.carrito));
  }

  // Obtener todos los productos
  getCarrito(): ProductoCarrito[] {
    return this.carrito;
  }

  // Agregar producto y guardar cambios
  agregarProducto(producto: ProductoCarrito): void {
    const existe = this.carrito.find(p => p.id === producto.id);
    if (existe) {
      existe.cantidad += producto.cantidad;
    } else {
      this.carrito.push(producto);
    }
    this.guardarEnLocalStorage();
  }

  // Eliminar producto y guardar cambios
  eliminarProducto(index: number): void {
    if (index > -1 && index < this.carrito.length) {
      this.carrito.splice(index, 1);
      this.guardarEnLocalStorage();
    }
  }

  // Limpiar carrito por completo
  limpiarCarrito(): void {
    this.carrito = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Cálculo del subtotal
  getSubtotal(): number {
    return this.carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }
}
