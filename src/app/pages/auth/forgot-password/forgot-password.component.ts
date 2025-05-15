import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { LoaderComponent } from '../../../components/shared/loader/loader.component';
import Swal from 'sweetalert2';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  imports: [ReactiveFormsModule, LoaderComponent, CommonModule],
  styleUrls: ['./forgot-password.component.css'],
  standalone: true
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;

  @Output() backToLogin = new EventEmitter<void>();

  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.valid) {
      const email = this.forgotForm.value.email;

      this.isLoading = true;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: '¡Código enviado!',
            text: response.message || 'Revisa tu correo electrónico',
            confirmButtonColor: '#14b8a6'
          }).then(() => {
            this.router.navigate(['/auth'], { queryParams: { mode: 'reset' } });
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error(error);
          Swal.fire({
            icon: 'error',
            title: 'Correo no encontrado',
            text: '¡No existe ninguna cuenta con ese correo!',
            confirmButtonColor: '#e3342f'
          });
        }
      });
    }
  }

  emitBack(): void {
    this.backToLogin.emit();
  }
}
