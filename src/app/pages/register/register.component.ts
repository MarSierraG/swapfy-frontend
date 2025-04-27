import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  styleUrls: [
    './register.component.css',
    '../../../assets/styles/swapfy-forms.css'
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;

      this.authService.register(formData).subscribe({
        next: (response) => {
          console.log('Registro exitoso', response);
          alert('Registro exitoso. Ahora puedes iniciar sesión.');
          this.registerForm.reset();
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error en el registro', error);

          // Priorizar mostrar el mensaje de error específico
          if (error.error && error.error.error) {
            this.errorMessage = error.error.error;
          } else if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Ocurrió un error inesperado.';
          }

          // Limpiar mensaje después de 4 segundos
          setTimeout(() => {
            this.errorMessage = null;
          }, 4000);
        }
      });
    } else {
      this.errorMessage = 'Por favor completa todos los campos correctamente.';
      setTimeout(() => {
        this.errorMessage = null;
      }, 4000);
    }
  }
}
