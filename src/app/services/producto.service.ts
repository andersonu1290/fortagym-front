import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/api/productos`;

  constructor(private http: HttpClient) {}

  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Ahora acepta FormData explícitamente para que los archivos viajen al backend
  guardarProducto(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/guardar`, formData);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/eliminar/${id}`);
  }
}
