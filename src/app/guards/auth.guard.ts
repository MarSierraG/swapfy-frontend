import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth/auth.service';

/**
 * Impide acceder rutas privadas si el usuario no está logueado.
 * Si no lo está, muestra un modal y redirige a /login.
 */

export const authGuard: CanActivateFn = (): boolean | Promise<UrlTree> => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  // ⬇️  Usuario NO logueado → mostrar SweetAlert2 y redirigir
  return Swal.fire({
    title: 'No estás logueado',
    text:  'Debes iniciar sesión para continuar.',
    icon:  'warning',
    confirmButtonText: 'Ir al login',
    confirmButtonColor: '#14b8a6',
    allowOutsideClick: false
  }).then(() => router.parseUrl('/login'));
};
