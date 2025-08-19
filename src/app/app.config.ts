// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

// 👇 importa el interceptor del loader
import { backendLoaderInterceptor } from './interceptors/backend-loader.interceptor';

let tokenAlreadyHandled = false;

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(SweetAlert2Module.forRoot()),
    importProvidersFrom(ReactiveFormsModule),

    provideHttpClient(
      withInterceptors([
        // 1) Loader: muestra/oculta overlay en llamadas a environment.apiUrl
        backendLoaderInterceptor,

        // 2) Tu interceptor de Auth + manejo de 401
        (req, next) => {
          const token = localStorage.getItem('token');
          const router = inject(Router);

          // Excluir peticiones externas (ej: Cloudinary)
          if (req.url.includes('cloudinary.com')) {
            return next(req);
          }

          const modifiedReq = token
            ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
            : req;

          return next(modifiedReq).pipe(
            catchError((error) => {
              if (error.status === 401 && !tokenAlreadyHandled) {
                tokenAlreadyHandled = true;
                localStorage.clear();

                import('sweetalert2').then(Swal => {
                  Swal.default.fire({
                    icon: 'warning',
                    title: 'Sesión expirada',
                    text: 'Tu sesión ha caducado. Por favor, inicia sesión de nuevo.',
                    confirmButtonText: 'Aceptar',
                    customClass: { confirmButton: 'btn btn-primary' },
                    buttonsStyling: false
                  }).then(() => {
                    tokenAlreadyHandled = false;
                    router.navigate(['/login']);
                  });
                });
              }

              return throwError(() => error);
            })
          );
        }
      ])
    )
  ]
};
