import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService, ProductoCarrito } from '../../../services/cart.service';
import { ProductoService } from '../../../services/producto.service'; // 🔥 IMPORTANTE
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.scss']
})
export class CarritoComponent implements OnInit {

  public readonly ApiUrl = environment.apiUrl;

  codigoCupon: string = '';
  cuponAplicado: boolean = false;
  porcentajeDescuento: number = 0.10;

  // Ahora leerá de tu BD real
  recomendados: any[] = [];

  constructor(
    private cartService: CartService,
    private productoService: ProductoService, // Inyectado
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatosRecomendados();
  }

  get carrito(): ProductoCarrito[] { return this.cartService.getCarrito(); }
  get cantidadTotal(): number { return this.carrito.reduce((acc, item) => acc + item.cantidad, 0); }
  get subtotal(): number { return this.cartService.getSubtotal(); }
  get descuento(): number { return this.cuponAplicado ? this.subtotal * this.porcentajeDescuento : 0; }
  get total(): number { return this.subtotal - this.descuento; }

  cambiarCantidad(index: number, delta: number): void {
    const item = this.carrito[index];
    const nuevaCantidad = item.cantidad + delta;
    if (nuevaCantidad >= 1 && nuevaCantidad <= 99) {
      this.cartService.actualizarCantidadExacta(item.id, nuevaCantidad);
    }
  }

  eliminarItem(index: number): void {
    this.cartService.eliminarProducto(index);
  }

  agregarRecomendado(rec: any): void {
    const nuevoProducto: ProductoCarrito = {
      id: rec.id,
      nombre: rec.nombre,
      categoria: rec.categoria,
      descripcion: rec.descripcion || 'Producto FortaGym premium',
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

  resolverImg(img: string): string {
    if (!img) return 'https://via.placeholder.com/400x300?text=Sin+Imagen';
    if (img.startsWith('http')) return img;
    return `${this.ApiUrl}${img}`;
  }

  // 🔥 Se conecta a tu backend real para traer recomendaciones
  private cargarDatosRecomendados(): void {
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        // Tomamos solo los 4 primeros productos de la BD para mostrarlos abajo
        this.recomendados = productos.slice(0, 4);
      },
      error: (err) => console.error("Error cargando recomendados:", err)
    });
  }
}
