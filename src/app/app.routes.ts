import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { HomeComponent }      from './pages/home/home.component';
import { StoreComponent }     from './pages/store/store.component';
import { CreateItemComponent } from './pages/create-item/create-item.component';
import { AuthPageComponent } from './pages/auth/auth-page.component';
import {ForgotPasswordComponent} from './pages/auth/forgot-password/forgot-password.component';
import {ResetPasswordComponent} from './pages/auth/reset-password/reset-password.component';
import {SettingsComponent} from './pages/settings/settings.component';
import {AdminGuard} from './services/auth/admin.guard';


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

  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, AdminGuard]
  },


  {
    path: 'admin/users',
    loadComponent: () =>
      import('./pages/admin/users/users.component').then(m => m.UsersComponent),
    canActivate: [authGuard, AdminGuard]
  },

  {
    path: 'articulo/:id',
    loadComponent: () =>
      import('./pages/item-detail/item-detail.component').then(m => m.ItemDetailComponent)
  },

  {
    path: 'admin/items',
    loadComponent: () =>
      import('./pages/admin/items/items.component').then(m => m.AdminItemsComponent),
    canActivate: [authGuard, AdminGuard]
  },

  {
    path: 'admin/tags',
    loadComponent: () =>
      import('./pages/admin/tags/tags.component').then(m => m.TagsComponent),
    canActivate: [authGuard, AdminGuard]
  },

  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard]
  },

  {
    path: 'chats',
    loadChildren: () =>
      import('./pages/messages/messages.routes').then(m => m.MESSAGES_ROUTES),
  },

  {
    path: 'summary',
    loadComponent: () =>
      import('./pages/summary-page/summary-page.component').then(m => m.SummaryPageComponent)
  },

  {
    path: 'admin/credits',
    loadComponent: () =>
      import('./pages/admin/credits/credit-admin-page.component').then(m => m.CreditAdminPageComponent),
    canActivate: [authGuard, AdminGuard]
  },

  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
  },

  {
    path: 'admin/messages-admin',
    loadComponent: () => import('./pages/admin/messages/message-chat.component').then(m => m.MessagesComponent),
    canActivate: [authGuard, AdminGuard]
  },

  {
    path: 'admin/messages-admin/user/:id',
    loadComponent: () =>
      import('./pages/messages-admin-user/messages-admin-user.component').then(m => m.MessagesAdminUserComponent),
      canActivate: [authGuard, AdminGuard]
  },

  {
    path: 'admin/messages-admin/conversation/:userId/:otherUserId',
    loadComponent: () =>
      import('./pages/messages-admin-user/messages-admin-conversation/messages-admin-conversation.component').then(
        (m) => m.MessagesAdminConversationComponent
      ),
    canActivate: [authGuard, AdminGuard]
  },


  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
  }

];
