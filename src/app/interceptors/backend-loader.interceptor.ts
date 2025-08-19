import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { BackendLoaderService } from '../services/backend-loader.service';
import { environment } from '../../environments/environment';

export const backendLoaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(BackendLoaderService);

  // Solo activar para llamadas a tu API (evita assets, CDN, etc.)
  // Ajusta la condición si usas otros dominios
  const isApiCall = req.url.startsWith(environment.apiUrl);

  if (!isApiCall) {
    return next(req);
  }

  loader.requestStarted();

  return next(req).pipe(
    // aunque haya error o éxito, siempre ocultamos cuando termina
    finalize(() => loader.requestFinished())
  );
};
