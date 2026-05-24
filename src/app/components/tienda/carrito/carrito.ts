import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../../services/cart.service';

// Interfaces
export interface ProductoCarrito {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  img: string;
}

export interface ProductoRecomendado {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  img: string;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.scss']
})
export class CarritoComponent implements OnInit {

  // Variables de control de cupones
  codigoCupon: string = '';
  cuponAplicado: boolean = false;
  porcentajeDescuento: number = 0.10; // 10%

  // Array para recomendados locales
  recomendados: ProductoRecomendado[] = [];

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatosRecomendados();
  }

  // GETTERS: Leen el estado directamente desde el CartService
  get carrito(): ProductoCarrito[] {
    return this.cartService.getCarrito();
  }

  get cantidadTotal(): number {
    return this.carrito.reduce((acc, item) => acc + item.cantidad, 0);
  }

  get subtotal(): number {
    return this.cartService.getSubtotal();
  }

  get descuento(): number {
    return this.cuponAplicado ? this.subtotal * this.porcentajeDescuento : 0;
  }

  get total(): number {
    return this.subtotal - this.descuento;
  }

  // MÉTODOS DE LÓGICA
  cambiarCantidad(index: number, delta: number): void {
    const item = this.carrito[index];
    const nuevaCantidad = item.cantidad + delta;

    if (nuevaCantidad >= 1 && nuevaCantidad <= 99) {
      item.cantidad = nuevaCantidad;
    }
  }

  eliminarItem(index: number): void {
    this.cartService.eliminarProducto(index);
  }

  agregarRecomendado(rec: ProductoRecomendado): void {
    const nuevoProducto: ProductoCarrito = {
      id: rec.id,
      nombre: rec.nombre,
      categoria: rec.categoria,
      descripcion: 'Producto FortaGym premium',
      precio: rec.precio,
      cantidad: 1,
      img: rec.img
    };
    this.cartService.agregarProducto(nuevoProducto);
  }

  aplicarCupon(): void {
    this.cuponAplicado = (this.codigoCupon.trim().toUpperCase() === 'FORTA10');
  }

  irACompra(): void {
    if (this.carrito.length > 0) {
      this.router.navigate(['/compra']);
    } else {
      alert("Tu carrito está vacío.");
    }
  }

  private cargarDatosRecomendados(): void {
    this.recomendados = [
      { id: 101, nombre: 'Creatina micronizada 500g', categoria: 'Suplementos', precio: 99.00, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&q=80' },
      { id: 102, nombre: 'Cinturón olímpico cuero', categoria: 'Accesorios', precio: 139.90, img: 'https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?w=300&q=80' },
      { id: 103, nombre: 'Shaker FortaGym 700ml', categoria: 'Accesorios', precio: 29.90, img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80' },
      { id: 104, nombre: 'BCAA Essential 300g', categoria: 'Suplementos', precio: 79.00, img: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=300&q=80' }
    ];
  }
}
