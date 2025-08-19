// src/app/interceptors/backend-loader.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { BackendLoaderService } from '../services/backend-loader.service';
import { environment } from '../../environments/environment';

const COLD_MS = 12 * 60 * 1000;  // 12 min sin actividad = probable sleep de Render
const SLOW_MS = 4000;            // safety net: si una request tarda >4s, muestra overlay

export const backendLoaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(BackendLoaderService);

  // Limitar solo a tu API
  const isApiCall = req.url.startsWith(environment.apiUrl);
  // Excluir ping público/health
  const isPing = req.url.startsWith(`${environment.apiUrl}/public/ping`);
  // Excluir recursos externos comunes (p.ej. Cloudinary)
  const isExternal = !isApiCall || req.url.includes('cloudinary.com');

  if (isExternal || isPing) {
    return next(req);
  }

  // Heurística de "frío"
  const lastOk = Number(localStorage.getItem('lastApiOkAt') || 0);
  const inactiveMs = Date.now() - lastOk;
  const isCold = inactiveMs > COLD_MS;

  // Mostrarlo solo una vez por sesión cuando está frío
  const alreadyShownCold = sessionStorage.getItem('shownColdOverlay') === '1';

  let slowTimer: any = null;
  let usedSlowPath = false;
  let usedColdPath = false;

  if (isCold && !alreadyShownCold) {
    usedColdPath = true;
    sessionStorage.setItem('shownColdOverlay', '1');
    loader.forceShow(); // aparece YA (caso Render dormido)
  } else {
    // No frío: NO mostrar por defecto.
    // Solo si la request se alarga demasiado, lo mostramos (safety net).
    slowTimer = setTimeout(() => {
      usedSlowPath = true;
      loader.requestStarted(); // usa el contador del servicio
    }, SLOW_MS);
  }

  return next(req).pipe(
    finalize(() => {
      if (slowTimer) clearTimeout(slowTimer);

      // Ocultar según la vía usada
      if (usedColdPath) {
        loader.forceHide();
      }
      if (usedSlowPath) {
        loader.requestFinished();
      }

      // Marca de última actividad OK (si falló igual nos vale para resetear inactividad)
      localStorage.setItem('lastApiOkAt', String(Date.now()));
    })
  );
};
