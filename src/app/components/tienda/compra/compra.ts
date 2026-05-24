import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './compra.html',
  styleUrls: ['./compra.scss']
})
export class CompraComponent implements OnInit {
  checkoutForm!: FormGroup;

  // Variables de control de flujo para las pantallas
  vistaActual: string = 'compra'; // Estados: 'compra' | 'confirmacion'
  numeroOrden: string = '';
  fechaActual: Date = new Date();
  carritoConfirmado: any[] = [];
  subtotalConfirmado: number = 0;
  descuentoConfirmado: number = 0;
  igvConfirmado: number = 0;
  totalConfirmado: number = 0;

  // Datos mockeados del producto (según tu interfaz)
  producto = {
    nombre: 'WHEY PROTEIN GOLD STANDARD 2KG',
    categoria: 'SUPLEMENTOS',
    precio: 250.00,
    imagen: 'assets/img/whey.png' // Reemplaza con tu ruta real
  };

  // Variables de estado del carrito
  qty: number = 3; // Inicializado en 3 como en tu captura de pantalla
  shipCost: number | null = null;
  couponCode: string = '';
  hasDsc: boolean = false;
  discountPercentage: number = 0.10; // Cupón FORTA10 = 10%

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // 🛠️ INTEGRACIÓN TOTAL: Mapeo completo de datos de cliente, entrega, tarjeta y términos
    this.checkoutForm = this.fb.group({
      // Datos personales
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      telefono: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],

      // Dirección de envío
      departamento: ['', Validators.required],
      provincia: ['', Validators.required],
      distrito: ['', Validators.required],
      codigoPostal: ['', Validators.required],
      direccion: ['', Validators.required],
      referencia: [''],

      // Método de entrega (Ej: 'domicilio', 'express', 'sede')
      metodoEntrega: ['domicilio', Validators.required],

      // Método de pago (Ej: 'tarjeta', 'transferencia', 'yape', 'efectivo')
      metodoPago: ['tarjeta', Validators.required],

      // Datos de la Tarjeta de Crédito/Débito
      numeroTarjeta: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      nombreTarjeta: ['', Validators.required],
      vencimiento: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\\/?([0-9]{2})$')]], // MM/AA
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
      guardarTarjeta: [false],

      // Términos y condiciones (Debe ser true obligatoriamente)
      aceptarTerminos: [false, Validators.requiredTrue]
    });
  }

  // Cálculos dinámicos (Getters reemplazan a la función recalc() del JS)
  get subtotal(): number {
    return this.producto.precio * this.qty;
  }

  get discountAmount(): number {
    return this.hasDsc ? this.subtotal * this.discountPercentage : 0;
  }

  get total(): number {
    const envio = this.shipCost || 0;
    return (this.subtotal - this.discountAmount) + envio;
  }

  get igv(): number {
    // Calculado de forma informativa asumiendo que el total ya incluye IGV (18% en Perú)
    return this.total - (this.total / 1.18);
  }

  // Métodos de interacción
  chQty(delta: number): void {
    this.qty = Math.max(1, Math.min(99, this.qty + delta));
  }

  applyCoupon(): void {
    const v = this.couponCode.trim().toUpperCase();
    this.hasDsc = (v === 'FORTA10');
  }

  selDel(cost: number): void {
    this.shipCost = cost;
  }

  confirmarPedido(): void {
    if (this.checkoutForm.valid) {
      // 1. Almacenamos los valores finales calculados para pasarlos estáticos a la vista de confirmación
      this.numeroOrden = Math.floor(100000 + Math.random() * 900000).toString();
      this.fechaActual = new Date();
      this.subtotalConfirmado = this.subtotal;
      this.descuentoConfirmado = this.discountAmount;
      this.igvConfirmado = this.igv;
      this.totalConfirmado = this.total;

      // 2. Mapeamos el item comprado a la lista que itera el HTML de confirmación
      this.carritoConfirmado = [{
        nombre: this.producto.nombre,
        categoria: this.producto.categoria,
        precio: this.producto.precio,
        cantidad: this.qty,
        img: this.producto.imagen
      }];

      // 3. Cambiamos la vista para renderizar la pantalla de pedido confirmado
      this.vistaActual = 'confirmacion';

      console.log('Datos listos para enviar al backend:', {
        cliente: this.checkoutForm.value,
        pedido: {
          total: this.totalConfirmado,
          descuento: this.descuentoConfirmado,
          envio: this.shipCost
        }
      });
    } else {
      console.log('Formulario Inválido. Estado actual de los campos:', this.checkoutForm.controls);
      this.checkoutForm.markAllAsTouched(); // Esto activará los bordes rojos del SCSS
      alert("Por favor, revisa los campos en rojo. (Asegúrate de no dejar espacios en la tarjeta o DNI y aceptar los términos).");
    }
  }

  // Método para regresar desde la confirmación a la pantalla del proceso de compra
  volverAlCarrito(): void {
    this.vistaActual = 'compra';
  }


}

