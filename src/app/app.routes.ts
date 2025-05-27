import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { HomeComponent }      from './pages/home/home.component';
import { StoreComponent }     from './pages/store/store.component';
import { DummyComponent }     from './pages/dummy/dummy.component';
import { CreateItemComponent } from './pages/create-item/create-item.component';
import { AuthPageComponent } from './pages/auth/auth-page.component';
import {ForgotPasswordComponent} from './pages/auth/forgot-password/forgot-password.component';
import {ResetPasswordComponent} from './pages/auth/reset-password/reset-password.component';
import {SettingsComponent} from './pages/settings/settings.component';

export const routes: Routes = [
/* Rutas públicas */
  { path: 'auth', component: AuthPageComponent },
  { path: 'login', redirectTo: 'auth?mode=login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth?mode=register', pathMatch: 'full' },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },


  { path: '', redirectTo: '/auth', pathMatch: 'full' },

  /* Rutas privadas */
  { path: 'home',           component: HomeComponent,        canActivate: [authGuard] },
  { path: 'store',          component: StoreComponent,       canActivate: [authGuard] },
  { path: 'crear-articulo', component: CreateItemComponent,  canActivate: [authGuard] },
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

  {
    path: 'articulo/:id',
    loadComponent: () =>
      import('./pages/item-detail/item-detail.component').then(m => m.ItemDetailComponent)
  },

  {
    path: 'admin/items',
    loadComponent: () => import('./pages/admin/items/items.component').then(m => m.AdminItemsComponent)
  },

  {
    path: 'admin/tags',
    loadComponent: () => import('./pages/admin/tags/tags.component').then(m => m.TagsComponent),
    canActivate: [authGuard]
  },

  {
    path: 'settings',
    component: SettingsComponent
  },

  {
    path: 'chats',
    loadChildren: () =>
      import('./pages/messages/messages.routes').then(m => m.MESSAGES_ROUTES),
  },

  {
    path: 'summary',
    loadComponent: () => import('./pages/summary-page/summary-page.component').then(m => m.SummaryPageComponent)
  },

  {
    path: 'admin/credits',
    loadComponent: () =>
      import('./pages/admin/credits/credit-admin-page.component').then(
        (m) => m.CreditAdminPageComponent
      ),
  },


  { path: '**', redirectTo: '' }
];
