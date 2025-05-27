import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CreditService } from '../../../services/credits/credit.service';
import { Credit } from '../../../models/credit.model';
import { NavbarWrapperComponent } from '../../../components/layout/navbar-wrapper/navbar-wrapper.component';
import { LoaderComponent } from '../../../components/shared/loader/loader.component';
import Swal from 'sweetalert2';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-credit-admin-page',
  standalone: true,
  imports: [CommonModule, DatePipe, NavbarWrapperComponent, LoaderComponent, FormsModule],
  templateUrl: './credit-admin-page.component.html',
  styleUrls: ['./credit-admin-page.component.css']
})
export class CreditAdminPageComponent implements OnInit {
  credits: Credit[] = [];
  isLoading = true;
  searchValue: string = '';
  selectedFilter: string = 'id';
  visibleCount: number = 15;


  constructor(private creditService: CreditService) {}

  ngOnInit(): void {
    this.fetchCredits();
  }

  get filteredCredits(): Credit[] {
    const term = this.searchValue;

    return this.credits.filter(credit => {
      switch (this.selectedFilter) {
        case 'id':
          return credit.creditId.toString().includes(term);
        case 'user':
          return credit.userName?.toLowerCase().includes(term.toLowerCase());
        case 'userId':
          return credit.userId?.toString().includes(term);
        case 'type':
          return credit.type?.toLowerCase().includes(term.toLowerCase());
        case 'amount':
          return credit.amount?.toString().includes(term);
        default:
          return true;
      }
    });
  }





  fetchCredits() {
    this.creditService.getAllCredits().subscribe({
      next: (data) => {
        this.credits = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar créditos:', err);
        this.isLoading = false;
      }
    });
  }

  editCredit(credit: Credit): void {
    Swal.fire({
      title: `Editar movimiento #${credit.creditId}`,
      html: `
     <input type="number" class="swal2-input" placeholder="Monto" value="${credit.amount}" disabled />
      <input id="swal-type" type="text" class="swal2-input" placeholder="Tipo de movimiento" value="${credit.type}" />
    `,
      confirmButtonText: 'Guardar cambios',
      showCancelButton: true,
      focusConfirm: false,
      customClass: {
        popup: 'border rounded shadow-sm',
        confirmButton: 'btn btn-primary me-2',
        cancelButton: 'btn btn-outline-secondary',
      },
      buttonsStyling: false,
      preConfirm: () => {
        const type = (document.getElementById('swal-type') as HTMLInputElement).value.trim();

        if (type.length < 3 || type.length > 100) {
          Swal.showValidationMessage('El tipo debe tener entre 3 y 100 caracteres.');
          return;
        }

        return { type };
      }

    }).then(result => {
      if (result.isConfirmed && result.value) {
        const newType = result.value.type;

        if (newType === credit.type) {
          Swal.fire({
            icon: 'info',
            title: 'Sin cambios detectados',
            text: 'No se ha modificado ningún dato del movimiento.'
          });
          return;
        }

        this.creditService.updateCredit(credit.creditId, { type: newType }).subscribe({
          next: () => {
            credit.type = newType;
            Swal.fire('Actualizado', 'La descripción ha sido modificada.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No se pudo actualizar el crédito.', 'error');
          }
        });
      }
    });
  }

  deleteCredit(credit: Credit): void {
    const creditImpact = credit.amount > 0
      ? `Se descontarán ${credit.amount} créditos del saldo total del usuario.`
      : `Se devolverán ${Math.abs(credit.amount)} créditos al usuario.`;

    Swal.fire({
      title: `¿Eliminar el movimiento #${credit.creditId}?`,
      html: `
      <p>Esta acción <strong>no se puede deshacer</strong>.</p>
      <p class="text-start">${creditImpact}</p>
    `,
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
        cancelButton: 'btn btn-outline-secondary',
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        this.creditService.deleteCredit(credit.creditId).subscribe({
          next: () => {
            this.credits = this.credits.filter(c => c.creditId !== credit.creditId);
            Swal.fire('Eliminado', 'El movimiento ha sido eliminado y el saldo ha sido actualizado.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el crédito.', 'error');
          }
        });
      }
    });
  }

  showMoreCredits(): void {
    this.visibleCount += 15;
  }
}
