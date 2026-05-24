import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CartService, ProductoCarrito } from '../../../services/cart.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './compra.html',
  styleUrls: ['./compra.scss']
})
export class CompraComponent implements OnInit {

    private readonly ApiUrl = environment.apiUrl;

  checkoutForm!: FormGroup;
  vistaActual: 'compra' | 'confirmacion' = 'compra';
  confirmacionData: any = null;

  // Variables para confirmación
  numeroOrden: string = '';
  fechaActual: Date = new Date();
  carritoConfirmado: ProductoCarrito[] = [];
  subtotalConfirmado: number = 0;
  descuentoConfirmado: number = 0;
  igvConfirmado: number = 0;
  totalConfirmado: number = 0;

  shipCost: number = 0;
  couponCode: string = '';
  hasDsc: boolean = false;
  discountPercentage: number = 0.10;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      telefono: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      departamento: ['', Validators.required],
      provincia: ['', Validators.required],
      distrito: ['', Validators.required],
      codigoPostal: [''],
      direccion: ['', Validators.required],
      referencia: [''],
      metodoEntrega: ['domicilio', Validators.required],
      metodoPago: ['tarjeta', Validators.required],
      numeroTarjeta: [''],
      nombreTarjeta: [''],
      vencimiento: [''],
      cvv: [''],
      guardarTarjeta: [false],
      aceptarTerminos: [false, Validators.requiredTrue]
    });
  }

  // --- GETTERS ---
  get carrito(): ProductoCarrito[] {
    return this.cartService.getCarrito();
  }

  get qty(): number {
    return this.carrito.length > 0 ? this.carrito[0].cantidad : 0;
  }

  get subtotal(): number {
    return this.cartService.getSubtotal();
  }

  get discountAmount(): number {
    return this.hasDsc ? this.subtotal * this.discountPercentage : 0;
  }

  get total(): number {
    return (this.subtotal - this.discountAmount) + this.shipCost;
  }

  get igv(): number {
    return this.total - (this.total / 1.18);
  }

  // Getter para el producto que muestra el HTML
  get producto(): ProductoCarrito {
    return this.carrito.length > 0
      ? this.carrito[0]
      : {
          id: 0,
          nombre: '',
          categoria: '',
          precio: 0,
          img: '',
          cantidad: 0,
          descripcion: ''
        };
  }

  // --- MÉTODOS ---
  chQty(delta: number): void {
    if (this.carrito.length > 0) {

      const nueva = this.carrito[0].cantidad + delta;

      if (nueva >= 1 && nueva <= 99) {
        this.carrito[0].cantidad = nueva;
      }
    }
  }

  applyCoupon(): void {
    this.hasDsc = (
      this.couponCode.trim().toUpperCase() === 'FORTA10'
    );
  }

  selDel(cost: number): void {
    this.shipCost = cost;
  }

  confirmarPedido(): void {

    if (this.checkoutForm.valid && this.carrito.length > 0) {

      const payload = {
        usuarioId: 1,

        departamento: this.checkoutForm.value.departamento,
        provincia: this.checkoutForm.value.provincia,
        distrito: this.checkoutForm.value.distrito,
        direccion: this.checkoutForm.value.direccion,
        codigoPostal: this.checkoutForm.value.codigoPostal,
        referencia: this.checkoutForm.value.referencia,

        metodoEntrega: this.checkoutForm.value.metodoEntrega,
        metodoPago: this.checkoutForm.value.metodoPago,

        codigoCupon: this.hasDsc
          ? this.couponCode
          : null,

        items: this.carrito.map(item => ({
          productoId: item.id,
          cantidad: item.cantidad
        }))
      };

      // --- BUSCA ESTA SECCIÓN EN TU CÓDIGO Y REEMPLÁZALA ---

    this.http.post<any>(
      `${this.ApiUrl}/api/tienda/checkout`,
      payload
    ).subscribe({

      next: (res) => {
        this.confirmacionData = res;
        this.numeroOrden = res.numeroOrden || 'FG-999999';
        this.fechaActual = new Date();
        this.carritoConfirmado = [...this.carrito];
        this.subtotalConfirmado = this.subtotal;
        this.descuentoConfirmado = this.discountAmount;
        this.igvConfirmado = this.igv;
        this.totalConfirmado = this.total;
        this.vistaActual = 'confirmacion';
        this.cartService.limpiarCarrito();
        window.scrollTo(0, 0);
      },

      error: (err) => {
        alert(
          'Error: ' +
          (err.error?.message || 'Revisa tu conexión')
        );
      }
    });


    } else {

      if (this.carrito.length === 0) {

        alert('Tu carrito está vacío.');

      } else {

        this.checkoutForm.markAllAsTouched();

        alert(
          'Por favor, completa correctamente todos los campos obligatorios.'
        );
      }
    }
  }

  volverAlCarrito(): void {
    this.vistaActual = 'compra';
  }
}
