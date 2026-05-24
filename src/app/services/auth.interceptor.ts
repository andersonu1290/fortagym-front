import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // 1. Lógica para saber si la ruta es pública
  let isPublic = false;

  if (req.url.includes('/api/auth/login') || req.url.includes('/api/usuarios/registro')) {
    isPublic = true;
  }

  // 🔥 AQUÍ ESTÁ LA CORRECCIÓN: Solo es pública si es GET.
  // Si vas a guardar (POST) o eliminar (DELETE), esto será false y SÍ enviará el token.
  if (req.url.includes('/api/productos') && req.method === 'GET') {
    isPublic = true;
  }

  // 2. Si hay token y NO es una ruta pública, adjuntamos el token
  if (token && !isPublic) {
    let clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

    // Lógica para archivos (FormData) vs Texto (JSON)
    if (req.body instanceof FormData) {
      clonedReq = clonedReq.clone({
        headers: clonedReq.headers.delete('Content-Type')
      });
    } else {
      clonedReq = clonedReq.clone({
        setHeaders: { 'Content-Type': 'application/json' }
      });
    }

    return next(clonedReq);
  }

  // 3. Si es pública o no hay token, pasa la petición sin modificar
  return next(req);
};
