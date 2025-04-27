import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  styleUrls: [
    './login.component.css',
    '../../../assets/styles/swapfy-forms.css'
  ]

})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;

      this.authService.login(formData).subscribe({
        next: (response) => {
          console.log('✅ Login exitoso', response);

          localStorage.setItem('token', response.token);
          localStorage.setItem('userName', response.user.name);

          alert(`✅ Bienvenido, ${response.user.name}!`);
          this.loginForm.reset();
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Error en el login', error);

          if (error.error && error.error.error) {
            this.errorMessage = error.error.error;
          } else {
            this.errorMessage = 'Hubo un error inesperado.';
          }

          // 🔥 Cerramos automáticamente después de 5 segundos
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }
      });
    } else {
      this.errorMessage = 'Completa todos los campos.';
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    }
  }

}
