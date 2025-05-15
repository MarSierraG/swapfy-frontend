import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

/* Páginas standalone que ya tienes; basta con importar la clase */
import { LandingComponent }   from './pages/landing/landing.component';
import { HomeComponent }      from './pages/home/home.component';
import { StoreComponent }     from './pages/store/store.component';
import { DummyComponent }     from './pages/dummy/dummy.component';
import { CreateItemComponent } from './pages/create-item/create-item.component';
import { AuthPageComponent } from './pages/auth/auth-page.component';
import {ForgotPasswordComponent} from './pages/auth/forgot-password/forgot-password.component';
import {ResetPasswordComponent} from './pages/auth/reset-password/reset-password.component';
import { AdminComponent } from './pages/admin/admin.component';


export const routes: Routes = [
/* Rutas públicas */
  { path: 'auth', component: AuthPageComponent },
  { path: 'login', redirectTo: 'auth?mode=login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth?mode=register', pathMatch: 'full' },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },


  { path: '',          component: LandingComponent,  pathMatch: 'full' },

  /* Rutas privadas */
  { path: 'home',           component: HomeComponent,        canActivate: [authGuard] },
  { path: 'store',          component: StoreComponent,       canActivate: [authGuard] },
  { path: 'crear-articulo', component: CreateItemComponent,  canActivate: [authGuard] },
  { path: 'chats',          component: DummyComponent,       canActivate: [authGuard] },
  { path: 'settings',       component: DummyComponent,       canActivate: [authGuard] },
  { path: 'credits',        component: DummyComponent,       canActivate: [authGuard] },

  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard]
  },


  {
    path: 'admin/users',
    loadComponent: () =>
      import('./pages/admin/users/users.component').then(m => m.UsersComponent),
    canActivate: [authGuard]
  },






  /* ---------- catch‑all ---------- */
  { path: '**', redirectTo: '' }   // redirige a landing si la ruta no existe
];
