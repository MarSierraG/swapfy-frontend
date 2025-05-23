import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth/auth.service';
import {User, UserService} from '../../services/user/user.service';
import {NavbarWrapperComponent} from '../../components/layout/navbar-wrapper/navbar-wrapper.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn
} from '@angular/forms';
import { debounceTime, first, map, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';



@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  imports: [
    NavbarWrapperComponent,
    FormsModule,
    CommonModule,
    ReactiveFormsModule
  ],
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  user: User | null = null;
  editForm!: FormGroup;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,

  ) {}

  ngOnInit(): void {
    const userId = this.authService.currentUserId();
    if (!userId) return;

    this.userService.getUserById(userId).subscribe({
      next: (data) => {
        this.user = data;
        this.initEditForm();
      },
      error: (err) => console.error('Error al cargar el usuario', err)
    });
  }


  initEditForm() {
    this.editForm = this.fb.group({
      name: [
        this.user?.name || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100), this.nombreValidoValidator]
      ],
      email: [
        this.user?.email || '',
        [Validators.required, Validators.email, Validators.maxLength(254)],
        [this.emailUnicoValidator(this.user!.userId)]  // ⬅️ validación async
      ],
      location: [
        this.user?.location || '',
        [Validators.minLength(2), Validators.maxLength(100)]
      ],
      biography: [
        this.user?.biography || '',
        [Validators.maxLength(300)]
      ]
    });
  }


  private nombreValidoValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/;
    return regex.test(value.trim()) ? null : { nombreInvalido: true };
  }

  private emailUnicoValidator(excludeId: number): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const email = control.value;
      if (!email) return of(null);

      return of(email).pipe(
        debounceTime(400),
        switchMap(email =>
          this.authService.checkEmailExists(email, excludeId).pipe(
            map((exists: boolean) => (exists ? { emailDuplicado: true } : null)),
            catchError(() => of(null))
          )
        ),
        first()
      );
    };
  }

  isEditing = false;

  startEdit() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveChanges() {
    if (!this.user || !this.editForm.valid) {
      Swal.fire('Error', 'Por favor revisa los campos antes de guardar.', 'warning');
      return;
    }

    const updatedData = this.editForm.value;

    // Comparar cambios reales
    const noChanges =
      updatedData.name === this.user.name &&
      updatedData.email === this.user.email &&
      updatedData.location === this.user.location &&
      updatedData.biography === this.user.biography;

    if (noChanges) {
      Swal.fire({
        title: 'Sin cambios',
        text: 'No se ha modificado ningún dato del perfil.',
        icon: 'info',
        confirmButtonColor: '#14b8a6'
      });
      return;
    }

    this.userService.updateUser(this.user.userId, updatedData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.isEditing = false;

        Swal.fire({
          title: 'Perfil actualizado',
          text: 'Tus datos se han guardado correctamente.',
          icon: 'success',
          confirmButtonColor: '#14b8a6'
        });
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err);
        Swal.fire({
          title: 'Error',
          text: err?.error?.message || 'Ocurrió un problema al guardar los cambios.',
          icon: 'error',
          confirmButtonColor: '#e74c3c'
        });
      }
    });
  }



  logout(): void {
    this.authService.logout();
  }


  confirmDeleteAccount() {
    Swal.fire({
      title: '¿Estás segura/o?',
      text: 'Esta acción eliminará tu cuenta permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#999',
      confirmButtonText: 'Sí, eliminar cuenta',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Lógica para eliminar cuenta (llamada a UserService, etc.)
        this.userService.deleteUser(this.user!.userId).subscribe(() => {
          localStorage.clear();
          this.router.navigate(['/login']);
          Swal.fire('Cuenta eliminada', 'Tu cuenta ha sido eliminada correctamente.', 'success');
        });
      }
    });
  }



}
