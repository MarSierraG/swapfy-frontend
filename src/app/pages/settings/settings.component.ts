import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth/auth.service';
import {User, UserService} from '../../services/user/user.service';
import {NavbarWrapperComponent} from '../../components/layout/navbar-wrapper/navbar-wrapper.component';
import {FormsModule} from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  imports: [
    NavbarWrapperComponent,
    FormsModule,
    CommonModule
  ],
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  user: User | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,

  ) {}

  ngOnInit(): void {
    const userId = this.authService.currentUserId();
    console.log('ID de usuario actual:', userId);

    if (!userId) return;

    this.userService.getUserById(userId).subscribe({
      next: (data) => {
        console.log('Usuario cargado:', data);
        this.user = data;
      },
      error: (err) => console.error('Error al cargar el usuario', err)
    });
  }

  isEditing = false;

  startEdit() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveChanges() {
    if (!this.user) return;

    this.userService.updateUser(this.user.userId, {
      name: this.user.name,
      email: this.user.email,
      location: this.user.location,
      biography: this.user.biography,
      credits: this.user.credits,
    }).subscribe({
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
          text: 'Ocurrió un problema al guardar los cambios.',
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
