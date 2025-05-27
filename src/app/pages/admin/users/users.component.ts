import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user/user.service';
import { User } from '../../../models/user.model';
import Swal from 'sweetalert2';
import {LoaderComponent} from '../../../components/shared/loader/loader.component';
import {NavbarWrapperComponent} from '../../../components/layout/navbar-wrapper/navbar-wrapper.component';
import {MadridDatePipe} from '../../../pipes/madrid-date.pipe';


@Component({
  standalone: true,
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  imports: [CommonModule, FormsModule, LoaderComponent, NavbarWrapperComponent, MadridDatePipe],
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  searchText = '';

  selectedFilter: string = 'name';
  searchValue: string = '';
  visibleCount = 15;

  isLoading = true;




  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios', err);
        this.isLoading = false;
      }
    });
  }


  get filteredUsers(): User[] {
    const term = this.searchValue.toLowerCase();

    return this.users.filter(user => {
      switch (this.selectedFilter) {
        case 'id':
          return user.userId.toString().includes(term);
        case 'name':
          return user.name.toLowerCase().includes(term);
        case 'email':
          return user.email.toLowerCase().includes(term);
        case 'location':
          return (user.location || '').toLowerCase().includes(term);
        case 'role':
          return (user.roles?.[0] || '').toLowerCase().includes(term);
        default:
          return true;
      }
    });
  }



  deleteUser(user: User): void {
    Swal.fire({
      title: `¿Eliminar a ${user.name}?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#fff',
      iconColor: '#dc3545',
      customClass: {
        popup: 'border rounded shadow-sm',
        title: 'fw-bold text-danger',
        confirmButton: 'btn btn-danger me-2',
        cancelButton: 'btn btn-outline-secondary'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.userId).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.userId !== user.userId); // 👈 quitar de la tabla
            Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
          }
        });
      }
    });
  }


  openEditModal(user: User): void {
    const formHtml = `
    <input id="swal-name" class="swal2-input" placeholder="Nombre" value="${user.name}" />
    <input id="swal-email" class="swal2-input" placeholder="Email" value="${user.email}" />
    <input id="swal-location" class="swal2-input" placeholder="Localización" value="${user.location || ''}" />
    <input id="swal-biography" class="swal2-input" placeholder="Biografía" value="${user.biography || ''}" />
    <input id="swal-credits" type="number" class="swal2-input" placeholder="Créditos" value="${user.credits}" />
    <select id="swal-role" class="swal2-select">
      <option value="USER" ${user.roles?.[0] === 'USER' ? 'selected' : ''}>USER</option>
      <option value="ADMIN" ${user.roles?.[0] === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
    </select>
  `;

    Swal.fire({
      title: `Editar usuario: ${user.name}`,
      html: formHtml,
      confirmButtonText: 'Guardar cambios',
      showCancelButton: true,
      focusConfirm: false,
      customClass: {
        popup: 'border rounded shadow-sm',
        title: 'fw-bold',
        confirmButton: 'btn btn-primary me-2',
        cancelButton: 'btn btn-outline-secondary'
      },
      buttonsStyling: false,
      preConfirm: async () => {
        const name = (document.getElementById('swal-name') as HTMLInputElement).value.trim();
        const email = (document.getElementById('swal-email') as HTMLInputElement).value.trim();
        const location = (document.getElementById('swal-location') as HTMLInputElement).value.trim();
        const biography = (document.getElementById('swal-biography') as HTMLInputElement).value.trim();
        const credits = +(document.getElementById('swal-credits') as HTMLInputElement).value;
        const role = (document.getElementById('swal-role') as HTMLSelectElement).value;

        const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]{2,100}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!nombreRegex.test(name)) {
          Swal.showValidationMessage('El nombre debe tener entre 2 y 100 caracteres y solo puede contener letras, espacios y guiones.');
          return;
        }

        if (!email || !emailRegex.test(email) || email.length > 254) {
          Swal.showValidationMessage('Introduce un correo electrónico válido y que no supere los 254 caracteres.');
          return;
        }

        if (location && (location.length < 2 || location.length > 100)) {
          Swal.showValidationMessage('La localización debe tener entre 2 y 100 caracteres.');
          return;
        }

        if (biography && biography.length > 300) {
          Swal.showValidationMessage('La biografía no puede superar los 300 caracteres.');
          return;
        }


        if (isNaN(credits) || credits < 0) {
          Swal.showValidationMessage('Los créditos deben ser un número igual o mayor que 0.');
          return;
        }

        if (!['USER', 'ADMIN'].includes(role)) {
          Swal.showValidationMessage('El rol debe ser USER o ADMIN.');
          return;
        }

        // Validación email único
        const emailExists = this.users.some(u => u.email === email && u.userId !== user.userId);
        if (emailExists) {
          Swal.showValidationMessage('Este correo electrónico ya está en uso por otro usuario.');
          return;
        }

        return { name, email, location, biography, credits, role };
      }

    }).then(result => {
      if (result.isConfirmed && result.value) {
        const updatedUser = result.value;

        const noChanges =
          updatedUser.name === user.name &&
          updatedUser.email === user.email &&
          updatedUser.location === user.location &&
          updatedUser.biography === user.biography &&
          updatedUser.credits === user.credits &&
          updatedUser.role === user.roles?.[0];

        if (noChanges) {
          Swal.fire({
            icon: 'info',
            title: 'Sin cambios detectados',
            text: 'No se ha modificado ningún dato del usuario.'
          });
          return;
        }

        this.userService.updateUser(user.userId, updatedUser).subscribe({
          next: (response) => {
            const index = this.users.findIndex(u => u.userId === user.userId);
            if (index !== -1) this.users[index] = response;

            Swal.fire('Usuario actualizado', '', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error');
          }
        });
      }
    });
  }

  showBiography(user: User): void {
    Swal.fire({
      title: `<i class="bi bi-person-lines-fill me-2"></i> Biografía de ${user.name}`,
      html: `<p class="text-start">${user.biography || 'Sin biografía registrada.'}</p>`,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      background: '#f8f9fa',
      color: '#212529',
      customClass: {
        confirmButton: 'btn btn-primary',
        popup: 'border rounded shadow-sm'
      },
      buttonsStyling: false
    });

  }

  showMoreUsers(): void {
    this.visibleCount += 15;
  }


}
