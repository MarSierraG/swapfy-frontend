import {Component, EventEmitter, Output} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth/auth.service';
import {MessageService} from '../../messages/message.service';

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
    private messageService: MessageService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: [
        '',
        {
          validators: [
            Validators.required,
            Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
            Validators.maxLength(100)
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
      this.loginForm.markAllAsTouched();
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

          const userId = this.authService.currentUserId();

          if (!sessionStorage.getItem('alertedUnread') && userId) {
            this.messageService.getUnreadSummary(userId).subscribe((summary: Record<number, number>) => {
              const total = Object.values(summary).reduce((a, b) => a + b, 0);

              sessionStorage.setItem('alertedUnread', 'true');

              if (total > 0) {
                Swal.fire({
                  icon: 'info',
                  title: 'Tienes mensajes',
                  text: `Tienes ${total} mensaje${total > 1 ? 's' : ''} sin leer.`,
                  confirmButtonColor: '#14b8a6'
                }).then(() => this.router.navigate(['/home']));
              } else {
                this.router.navigate(['/home']);
              }
            });
          } else {
            this.router.navigate(['/home']);
          }
        });


      },
      error: (error) => {
        console.error('Error en el login', error);
        const backendMsg = error?.error?.error || 'Hubo un error inesperado.';

        Swal.fire({
          icon: 'error',
          title: 'Error al iniciar sesión',
          text: backendMsg,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#ef4444'
        });
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
