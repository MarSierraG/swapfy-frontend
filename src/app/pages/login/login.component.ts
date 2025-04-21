import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    ReactiveFormsModule
  ],
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  )

    {
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

          // Guardamos el token y el nombre del usuario
          localStorage.setItem('token', response.token);
          localStorage.setItem('userName', response.user.name);

          alert(`✅ Bienvenido, ${response.user.name}!`);
          this.loginForm.reset();
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('❌ Error en el login', error);
          alert('❌ Email o contraseña incorrectos.');
        }
      });
    } else {
      alert('❌ Completa todos los campos.');
    }
  }
}
