import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pedido } from '../components/historial-compras/historial-compras';

@Injectable({ providedIn: 'root' })
export class PedidosService {
  constructor(private http: HttpClient) {}

  obtenerPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${environment.apiUrl}/api/tienda/pedidos`);
  }
}
