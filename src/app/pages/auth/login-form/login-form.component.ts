import {Component, EventEmitter, Output} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: [
    './login-form.component.css',
    '../../../../assets/styles/swapfy-forms.css'
  ],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class LoginFormComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: [
        '',
        {
          validators: [
            Validators.required,
            Validators.email,
            Validators.maxLength(254)
          ],
          updateOn: 'change'
        }
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(/^[\w@#$%^&+=!."-]*$/)
        ]
      ]

    });
  }

  @Output() forgotPassword = new EventEmitter<void>();

  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.setTimedError('Completa todos los campos.');
      return;
    }

    const formData = this.loginForm.value;

    this.authService.login(formData).subscribe({
      next: ({ user }) => {
        console.log('Login exitoso');
        console.log('Usuario recibido del backend:', user);

        Swal.fire({
          title: `¡Bienvenido, ${user.name}!`,
          text: 'Has iniciado sesión correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#14b8a6'
        }).then(() => {
          this.loginForm.reset();

          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 100);
        });
      },
      error: (error) => {
        console.error('Error en el login', error);
        const backendMsg = error?.error?.error || 'Hubo un error inesperado.';
        this.setTimedError(backendMsg);
      }
    });
  }

  private setTimedError(msg: string) {
    this.errorMessage = msg;
    setTimeout(() => (this.errorMessage = null), 5000);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onForgotPasswordClick() {
    this.forgotPassword.emit();
  }
  @Output() register = new EventEmitter<void>();

  goToRegister() {
    this.register.emit();
  }

}
