import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  imports: [
    ReactiveFormsModule
  ],
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;

      this.authService.register(formData).subscribe({
        next: (response) => {
          console.log('✅ Usuario registrado correctamente', response);
          alert('✅ ¡Registro exitoso! Ahora puedes iniciar sesión.');
          this.registerForm.reset();
        },
        error: (error) => {
          console.error('❌ Error en el registro', error);
          alert('❌ Hubo un problema al registrar. Por favor, revisa los datos.');
        }
      });
    } else {
      console.log('Formulario inválido');
      alert('❌ Por favor completa todos los campos correctamente.');
    }
  }

}
