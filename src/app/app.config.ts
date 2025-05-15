import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(SweetAlert2Module.forRoot()),
    importProvidersFrom(ReactiveFormsModule),
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          const token = localStorage.getItem('token');

          if (req.url.includes('cloudinary.com')) {
            return next(req);
          }

          const modifiedReq = token
            ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
            : req;

          return next(modifiedReq).pipe(
            catchError((error) => {
              if (error.status === 401) {
                localStorage.clear();

                // Mostrar alerta elegante con SweetAlert2
                import('sweetalert2').then(Swal => {
                  Swal.default.fire({
                    icon: 'warning',
                    title: 'Sesión expirada',
                    text: 'Tu sesión ha caducado. Por favor, inicia sesión de nuevo.',
                    confirmButtonText: 'Aceptar',
                    customClass: {
                      confirmButton: 'btn btn-primary'
                    },
                    buttonsStyling: false
                  }).then(() => {
                    window.location.href = '/login';
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

