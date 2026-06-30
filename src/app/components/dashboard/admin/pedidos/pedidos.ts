import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../services/admin.service';
import { environment } from '../../../../../environments/environment'; // 🔥 Sin .development

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.html',
  styleUrls: ['./pedidos.scss']
})
export class AdminPedidosComponent implements OnInit {
  pedidos: any[] = [];
  pedidoSeleccionado: any = null;
  mostrarModal = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.adminService.getPedidosTienda().subscribe({
      next: (data) => this.pedidos = data,
      error: (err) => console.error('Error cargando pedidos', err)
    });
  }

  cambiarEstado(pedido: any, event: Event): void {
    const nuevoEstado = (event.target as HTMLSelectElement).value;

    if (confirm(`¿Seguro que deseas cambiar el estado a ${nuevoEstado}?`)) {
      this.adminService.actualizarEstadoPedido(pedido.id, nuevoEstado).subscribe({
        next: () => {
          pedido.estado = nuevoEstado;
          alert('Estado actualizado correctamente');
        },
        error: () => alert('Error al actualizar el estado')
      });
    } else {
      // Revertir el select si el usuario cancela
      (event.target as HTMLSelectElement).value = pedido.estado;
    }
  }

  verDetalles(pedido: any): void {
    this.pedidoSeleccionado = pedido;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.pedidoSeleccionado = null;
  }

  resolverImg(img: string): string {
    if (!img) return 'assets/images/producto-placeholder.png';
    if (img.startsWith('http')) return img;
    return `${environment.apiUrl}${img}`;
  }
}
