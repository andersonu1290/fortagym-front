import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PromocionService {
  private apiUrl = `${environment.apiUrl}/api/admin/promociones`;

  constructor(private http: HttpClient) {}

  getPromociones(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // 🎯 NUEVO: Conectar con el endpoint de la última promoción para la pantalla de inicio
  getUltimaPromocion(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ultima`);
  }

  // 🚀 CONEXIÓN DUAL BLINDADA Y MEJORADA: Ahora envía Titulo y Descripción
  subirPromocion(
    nombre: string,
    titulo: string,
    descripcion: string,
    archivo: File | null,
    url: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('titulo', titulo);           // 🆕 Envía el título al backend
    formData.append('descripcion', descripcion); // 🆕 Envía la descripción al backend

    // Si hay archivo físico, lo enviamos de forma nativa sin forzar el nombre
    if (archivo) {
      formData.append('file', archivo);
    }

    if (url) {
      formData.append('url', url);
    }

    return this.http.post(`${this.apiUrl}/subir`, formData);
  }

  // 🔄 PASO 2: Enviar los datos editados al backend mediante PUT
  editarPromocion(
    id: number,
    nombre: string,
    titulo: string,
    descripcion: string,
    archivo: File | null,
    url: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);

    // Si el usuario seleccionó un archivo nuevo, lo adjuntamos
    if (archivo) {
      formData.append('file', archivo);
    }

    // Si el usuario puso una URL nueva, la adjuntamos
    if (url) {
      formData.append('url', url);
    }

    // Usamos el método PUT apuntando al ID de la promoción que queremos cambiar
    return this.http.put(`${this.apiUrl}/editar/${id}`, formData);
  }

  eliminarPromocion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }
}
