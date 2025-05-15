import {Component, EventEmitter, Output} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-register-form',
  standalone: true,
  templateUrl: './register-form.component.html',
  styleUrls: [
    './register-form.component.css',
    '../../../../assets/styles/swapfy-forms.css'
  ],
  imports: [ReactiveFormsModule, CommonModule]
})
export class RegisterFormComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          this.passwordStrengthValidator
        ]
      ]
    });

  }

  @Output() backToLogin = new EventEmitter<void>();


  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const hasNumber = /\d/.test(value);
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasSymbol = /[^a-zA-Z0-9]/.test(value);
    const isValid = value.length >= 8 && hasNumber && hasLetter && hasSymbol;

    return isValid ? null : { weakPassword: true };
  }

  onSubmit(): void {
    if (!this.registerForm.valid) {
      this.setTimedError('Por favor completa todos los campos correctamente.');
      return;
    }

    const formData = this.registerForm.value;

    this.authService.register(formData).subscribe({
      next: () => {
        Swal.fire({
          title: 'Registro exitoso',
          text: '¡Ya puedes iniciar sesión!',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#14b8a6'
        }).then(() => {
          this.registerForm.reset();
          this.router.navigate(['/login']);
        });
      },
      error: (error) => {
        console.error('Error en el registro', error);
        const backendMsg =
          error?.error?.error ?? error?.error?.message ?? 'Ocurrió un error inesperado.';
        this.setTimedError(backendMsg);
      }
    });
  }

  private setTimedError(msg: string) {
    this.errorMessage = msg;
    setTimeout(() => (this.errorMessage = null), 4000);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  get password() {
    return this.registerForm.get('password');
  }

}


