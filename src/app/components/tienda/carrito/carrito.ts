import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Interfaces para tipar fuertemente nuestros datos
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

  // Datos del carrito
  carrito: ProductoCarrito[] = [];
  recomendados: ProductoRecomendado[] = [];

  // Cupón y Descuentos
  codigoCupon: string = '';
  cuponAplicado: boolean = false;
  porcentajeDescuento: number = 0.10; // 10% para FORTA10

  constructor() {}

  ngOnInit(): void {
    // Inicializamos con los datos mockeados
    this.cargarDatosIniciales();
  }

  // ==========================================
  // GETTERS (Calculan totales en tiempo real)
  // ==========================================

  get cantidadTotal(): number {
    return this.carrito.reduce((acc, item) => acc + item.cantidad, 0);
  }

  get subtotal(): number {
    return this.carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }

  get descuento(): number {
    return this.cuponAplicado ? this.subtotal * this.porcentajeDescuento : 0;
  }

  get total(): number {
    return this.subtotal - this.descuento;
  }

  // ==========================================
  // MÉTODOS DEL CARRITO
  // ==========================================

  cambiarCantidad(index: number, delta: number): void {
    const nuevaCantidad = this.carrito[index].cantidad + delta;
    if (nuevaCantidad >= 1 && nuevaCantidad <= 99) {
      this.carrito[index].cantidad = nuevaCantidad;
    }
  }

  eliminarItem(index: number): void {
    this.carrito.splice(index, 1);
  }

  agregarRecomendado(rec: ProductoRecomendado): void {
    // Verificamos si ya está en el carrito para solo sumarle 1
    const existe = this.carrito.find(item => item.id === rec.id);
    if (existe) {
      existe.cantidad++;
    } else {
      this.carrito.push({
        id: rec.id,
        nombre: rec.nombre,
        categoria: rec.categoria,
        descripcion: 'Producto FortaGym premium', // Descripción por defecto
        precio: rec.precio,
        cantidad: 1,
        img: rec.img
      });
    }
  }

  aplicarCupon(): void {
    const cupon = this.codigoCupon.trim().toUpperCase();
    this.cuponAplicado = (cupon === 'FORTA10');
  }

  // ==========================================
  // CARGA DE DATOS MOCK
  // ==========================================

  private cargarDatosIniciales(): void {
    this.carrito = [
      { id: 1, nombre: 'Whey Protein Gold 2kg', categoria: 'Suplementos', descripcion: 'Proteína de suero de leche, 24g por porción, sabor chocolate', precio: 189, cantidad: 1, img: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=200&q=80' },
      { id: 2, nombre: 'Guantes de entrenamiento pro', categoria: 'Accesorios', descripcion: 'Grip antideslizante, talla M, muñequera integrada', precio: 75, cantidad: 2, img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=80' },
      { id: 3, nombre: 'Camiseta Fortagym Dry-Fit', categoria: 'Ropa', descripcion: 'Tela de secado rápido, color negro, talla L', precio: 55, cantidad: 1, img: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=200&q=80' }
    ];

    this.recomendados = [
      { id: 101, nombre: 'Creatina micronizada 500g', categoria: 'Suplementos', precio: 99.00, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&q=80' },
      { id: 102, nombre: 'Cinturón olímpico cuero', categoria: 'Accesorios', precio: 139.90, img: 'https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?w=300&q=80' },
      { id: 103, nombre: 'Shaker FortaGym 700ml', categoria: 'Accesorios', precio: 29.90, img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80' },
      { id: 104, nombre: 'BCAA Essential 300g', categoria: 'Suplementos', precio: 79.00, img: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=300&q=80' }
    ];
  }
}
