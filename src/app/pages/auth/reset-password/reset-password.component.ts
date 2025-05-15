import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { LoaderComponent } from '../../../components/shared/loader/loader.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent]
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirm: boolean = false;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.resetForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        code: ['', Validators.required],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            passwordStrengthValidator
          ]
        ],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: [this.passwordsMatchValidator]
      }
    );
  }

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      const { email, code, newPassword } = this.resetForm.value;

      this.isLoading = true;

      this.authService.resetPassword({ email, code, newPassword }).subscribe({
        next: (response) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: '¡Contraseña actualizada!',
            text: typeof response === 'string' ? response : 'Ahora puedes iniciar sesión',
            confirmButtonColor: '#14b8a6'
          }).then(() => {
            this.router.navigate(['/auth'], { queryParams: { mode: 'login' } });
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error(error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El código es inválido o ha expirado',
            confirmButtonColor: '#e3342f'
          });
        }
      });
    }
  }
}

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  const hasNumber = /\d/.test(value);
  const hasLetter = /[a-zA-Z]/.test(value);
  const hasSymbol = /[^a-zA-Z0-9]/.test(value);
  const isValid = value.length >= 8 && hasNumber && hasLetter && hasSymbol;

  return isValid ? null : { weakPassword: true };
}

