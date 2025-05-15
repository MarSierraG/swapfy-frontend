import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginFormComponent } from './login-form/login-form.component';
import { RegisterFormComponent } from './register-form/register-form.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';


@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    LoginFormComponent,
    RegisterFormComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ],
})
export class AuthPageComponent {

  formMode: 'login' | 'register' | 'forgot' | 'reset' = 'login';

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.queryParamMap.subscribe(params => {
      const mode = params.get('mode') as 'login' | 'register' | 'forgot' | 'reset';
      if (mode === 'register' || mode === 'forgot' || mode === 'reset') {
        this.formMode = mode;
      } else {
        this.formMode = 'login';
      }
    });
  }

  get isRegisterActive(): boolean {
    return this.formMode === 'register';
  }

  setFormMode(mode: 'login' | 'register' | 'forgot'): void {
    this.formMode = mode;
    this.router.navigate([], {
      queryParams: { mode },
      queryParamsHandling: 'merge'
    });
  }


}
