import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import {Routes} from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import {LandingComponent} from './pages/landing/landing.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent }, // Mantener tu home de usuario logueado
  { path: '**', redirectTo: 'login' } // Redirige cualquier ruta desconocida
];
