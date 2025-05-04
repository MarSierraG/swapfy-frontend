import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import {Routes} from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import {LandingComponent} from './pages/landing/landing.component';
import {DummyComponent} from './pages/dummy/dummy.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: '**', redirectTo: 'login' },
  { path: 'store', component: DummyComponent },
  { path: 'chats', component: DummyComponent },
  { path: 'settings', component: DummyComponent },
  { path: 'credits', component: DummyComponent }

];
