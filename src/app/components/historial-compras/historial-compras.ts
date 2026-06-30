import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // 🔥 Importamos HttpClient
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment'; // 🔥 Importamos el environment
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ItemPedido {
  id: number;
  nombre: string;
  categoria: string;
  img: string;
  precio: number;
  cantidad: number;
}

export type EstadoPedido = 'procesando' | 'en_camino' | 'entregado' | 'cancelado';

export interface Pedido {
  id: number;
  numeroOrden: string;
  fechaCreacion: Date | string;
  estado: EstadoPedido;
  items: ItemPedido[];
  subtotal: number;
  costoEnvio: number;
  descuento: number;
  igv: number;
  total: number;
  nombreCliente: string;
  metodoEntrega: string;
  direccion: string;
  distrito: string;
  departamento: string;
  metodoPago: string;
  correo: string;
}

export interface EtapaTimeline {
  titulo: string;
  icono: string;
  clase: 'done' | 'active' | 'pending';
  fecha?: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const FALLBACK_IMG = 'assets/images/producto-placeholder.png';

const STATUS_LABELS: Record<EstadoPedido, string> = {
  procesando: 'Procesando',
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const STATUS_ICONS: Record<EstadoPedido, string> = {
  procesando: 'ti-clock',
  en_camino: 'ti-truck',
  entregado: 'ti-circle-check',
  cancelado: 'ti-x',
};

// Pipeline completo de estados en orden progresivo
const PIPELINE_ESTADOS: EstadoPedido[] = ['procesando', 'en_camino', 'entregado'];

const TIMELINE_CONFIG: Record<EstadoPedido, { titulo: string; icono: string }> = {
  procesando: { titulo: 'Pedido confirmado',  icono: 'ti-check'           },
  en_camino:  { titulo: 'En camino',          icono: 'ti-truck'           },
  entregado:  { titulo: 'Entregado',          icono: 'ti-circle-check'    },
  cancelado:  { titulo: 'Pedido cancelado',   icono: 'ti-x'               },
};

// ─── Componente ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-historial-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-compras.html',
  styleUrls: ['./historial-compras.scss'],
})
export class HistorialComprasComponent implements OnInit, OnDestroy {

  // ── Estado de UI ──────────────────────────────────────────────
  cargando = false;
  pedidoExpandido: number | null = null;

  // ── Datos ─────────────────────────────────────────────────────
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];

  // ── Stats calculadas ──────────────────────────────────────────
  totalPedidos = 0;
  totalGastado = 0;
  pedidosActivos = 0;

  // ── Filtros ───────────────────────────────────────────────────
  terminoBusqueda = '';
  filtroEstado: EstadoPedido | '' = '';
  filtroPeriodo = '';

  private destroy$ = new Subject<void>();

  // 🔥 Inyectamos el HttpClient para comunicarnos con Spring Boot
  constructor(
    private http: HttpClient
  ) {}

  // ── Ciclo de vida ─────────────────────────────────────────────

  ngOnInit(): void {
    this.cargarPedidos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Carga de datos ────────────────────────────────────────────

  cargarPedidos(): void {
    this.cargando = true;

    // 🔥 Llamada real al backend en lugar de setTimeout
    this.http.get<Pedido[]>(`${environment.apiUrl}/api/tienda/pedidos`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargando = false)
      )
      .subscribe({
        next: (data) => {
          this.inicializarDatos(data);
        },
        error: (err) => {
          console.error('Error al cargar pedidos desde el backend:', err);
        }
      });
  }

  private inicializarDatos(pedidos: Pedido[]): void {
    this.pedidos = pedidos;
    this.calcularStats();
    this.aplicarFiltros();
  }

  // ── Stats ─────────────────────────────────────────────────────

  private calcularStats(): void {
    this.totalPedidos = this.pedidos.length;

    this.totalGastado = this.pedidos
      .filter(p => p.estado !== 'cancelado')
      .reduce((acc, p) => acc + p.total, 0);

    this.pedidosActivos = this.pedidos
      .filter(p => p.estado === 'procesando' || p.estado === 'en_camino')
      .length;
  }

  // ── Filtros ───────────────────────────────────────────────────

  aplicarFiltros(): void {
    let resultado = [...this.pedidos];

    // Filtro por término de búsqueda (número de orden)
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.trim().toLowerCase();
      resultado = resultado.filter(p =>
        p.numeroOrden.toLowerCase().includes(termino)
      );
    }

    // Filtro por estado
    if (this.filtroEstado) {
      resultado = resultado.filter(p => p.estado === this.filtroEstado);
    }

    // Filtro por período
    if (this.filtroPeriodo) {
      const dias = Number(this.filtroPeriodo);
      const corte = new Date();
      corte.setDate(corte.getDate() - dias);
      resultado = resultado.filter(p => new Date(p.fechaCreacion) >= corte);
    }

    this.pedidosFiltrados = resultado;
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.filtroEstado    = '';
    this.filtroPeriodo   = '';
    this.aplicarFiltros();
  }

  // ── Expansión de tarjetas ─────────────────────────────────────

  toggleExpand(id: number): void {
    this.pedidoExpandido = this.pedidoExpandido === id ? null : id;
  }

  // ── Helpers de presentación ───────────────────────────────────

  getStatusLabel(estado: EstadoPedido): string {
    return STATUS_LABELS[estado] ?? estado;
  }

  getStatusIcon(estado: EstadoPedido): string {
    return STATUS_ICONS[estado] ?? 'ti-help';
  }

  getTimeline(estado: EstadoPedido): EtapaTimeline[] {
    if (estado === 'cancelado') {
      return [{
        titulo: TIMELINE_CONFIG.cancelado.titulo,
        icono:  TIMELINE_CONFIG.cancelado.icono,
        clase:  'active',
        fecha:  undefined,
      }];
    }

    const idxActual = PIPELINE_ESTADOS.indexOf(estado);

    return PIPELINE_ESTADOS.map((e, idx) => {
      let clase: EtapaTimeline['clase'];
      if (idx < idxActual)       clase = 'done';
      else if (idx === idxActual) clase = 'active';
      else                        clase = 'pending';

      return {
        titulo: TIMELINE_CONFIG[e].titulo,
        icono:  TIMELINE_CONFIG[e].icono,
        clase,
        fecha: undefined,
      };
    });
  }

  /**
   * 🔥 Devuelve la URL de la imagen. Concatena la API si es necesario.
   */
  resolverImg(img: string): string {
    if (!img || !img.trim()) {
      return FALLBACK_IMG;
    }
    // Si la imagen ya es una URL completa (ej. de internet), la devolvemos tal cual
    if (img.startsWith('http')) {
      return img;
    }
    // Si es una ruta local de Spring Boot (ej. /uploads/...), le agregamos el dominio
    return `${environment.apiUrl}${img}`;
  }

  // ── Acciones del pedido ───────────────────────────────────────

  cancelarPedido(id: number): void {
    if (!confirm('¿Estás seguro de que deseas cancelar este pedido?')) return;

    // 🔥 Llamada real al backend para cancelar
    this.http.put(`${environment.apiUrl}/api/tienda/pedidos/${id}/cancelar`, {})
      .subscribe({
        next: () => {
          alert('Pedido cancelado correctamente');
          this.cargarPedidos(); // Recargamos la tabla para ver el nuevo estado
        },
        error: (err) => console.error('Error al cancelar:', err)
      });
  }

  descargarFactura(id: number): void {
    // 1. Buscamos el pedido exacto
    const pedido = this.pedidos.find(p => p.id === id);
    if (!pedido) return;

    // 2. Creamos el documento PDF
    const doc = new jsPDF();

    // 3. Cabecera de la empresa
    doc.setFontSize(22);
    doc.setTextColor(255, 141, 34); // Color naranja de FortaGym
    doc.text('FORTAGYM', 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Boleta de Venta Electrónica', 14, 28);

    // 4. Datos del Cliente y Orden
    doc.setFontSize(10);
    doc.text(`Orden N°: ${pedido.numeroOrden}`, 14, 40);
    doc.text(`Fecha: ${new Date(pedido.fechaCreacion).toLocaleDateString()}`, 14, 46);
    doc.text(`Cliente: ${pedido.nombreCliente}`, 14, 52);
    doc.text(`Estado: ${pedido.estado.toUpperCase()}`, 14, 58);

    // 5. Preparar los datos de los productos para la tabla
    const bodyTabla = pedido.items.map(item => [
      item.cantidad,
      item.nombre,
      `S/. ${item.precio.toFixed(2)}`,
      `S/. ${(item.precio * item.cantidad).toFixed(2)}`
    ]);

    // 6. Dibujar la tabla
    autoTable(doc, {
      startY: 65,
      head: [['Cant.', 'Descripción del Producto', 'Precio Unit.', 'Subtotal']],
      body: bodyTabla,
      headStyles: { fillColor: [255, 141, 34] }, // Cabecera naranja
    });

    // 7. Totales (se calculan justo debajo de donde terminó la tabla)
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Costo de Envío: S/. ${pedido.costoEnvio.toFixed(2)}`, 140, finalY);
    doc.text(`Total Pagado: S/. ${pedido.total.toFixed(2)}`, 140, finalY + 8);

    // 8. Descargar el archivo
    doc.save(`Boleta_${pedido.numeroOrden}.pdf`);
  }

  rastrearPedido(id: number): void {
    console.log('[MOCK] Rastrear pedido ID:', id);
  }

  recomprar(pedido: Pedido): void {
    console.log('[MOCK] Recomprar pedido ID:', pedido.id);
  }
}
