import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../../services/item/item.service';
import {Item, Tag} from '../../../models/item.model';
import { ItemRequestDTO } from '../../../models/item-request.dto';
import Swal from 'sweetalert2';
import { LoaderComponent } from '../../../components/shared/loader/loader.component';
import { NavbarWrapperComponent } from '../../../components/layout/navbar-wrapper/navbar-wrapper.component';
import Choices from 'choices.js';


@Component({
  selector: 'app-items',
  standalone: true,
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css'],
  imports: [CommonModule, FormsModule, LoaderComponent, NavbarWrapperComponent]
})
export class AdminItemsComponent implements OnInit {
  items: Item[] = [];
  isLoading = true;

  selectedFilter = 'title';
  searchValue = '';
  visibleCount = 15;
  availableTags: Tag[] = [];


  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.itemService.getAvailableItems().subscribe({
      next: (data) => {
        this.items = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar artículos', err);
        this.isLoading = false;
      }
    });

    this.itemService.getTags().subscribe({
      next: (tags) => {
        this.availableTags = tags;
      },
      error: (err) => {
        console.error('Error al cargar etiquetas', err);
      }
    });

  }

  get filteredItems(): Item[] {
    const term = this.searchValue.toLowerCase();
    return this.items.filter(item => {
      switch (this.selectedFilter) {
        case 'id':
          return item.itemId.toString().includes(term);
        case 'title':
          return item.title.toLowerCase().includes(term);
        case 'type':
          return item.type.toLowerCase().includes(term);
        case 'status':
          return item.status.toLowerCase().includes(term);
        case 'userId':
          return item.userId.toString().includes(term);
        case 'userName':
          return item.userName?.toLowerCase().includes(term);
        default:
          return true;
      }
    });
  }

  deleteItem(item: Item): void {
    Swal.fire({
      title: `¿Eliminar "${item.title}"?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      iconColor: '#dc3545',
      background: '#fff',
      customClass: {
        popup: 'border rounded shadow-sm',
        title: 'fw-bold text-danger',
        confirmButton: 'btn btn-danger me-2',
        cancelButton: 'btn btn-outline-secondary'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        this.itemService.deleteItem(item.itemId).subscribe({
          next: () => {
            this.items = this.items.filter(i => i.itemId !== item.itemId);
            Swal.fire('¡Eliminado!', 'El artículo ha sido eliminado.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el artículo.', 'error');
          }
        });
      }
    });
  }

  openEditModal(item: Item): void {
    const formHtml = `
    <input id="swal-title" class="swal2-input" placeholder="Título (3-100 caracteres)" value="${item.title}" maxlength="100" />
    <textarea id="swal-description" class="swal2-textarea" placeholder="Descripción (10-500 caracteres)" maxlength="500">${item.description}</textarea>
    <input id="swal-credits" type="number" class="swal2-input" placeholder="Créditos" value="${item.creditValue}" min="1" max="999999" />
    <select id="swal-type" class="swal2-select">
      <option value="offer" ${item.type === 'offer' ? 'selected' : ''}>Oferta</option>
      <option value="demand" ${item.type === 'demand' ? 'selected' : ''}>Demanda</option>
    </select>
    <select id="swal-status" class="swal2-select">
      <option value="Available" ${item.status === 'Available' ? 'selected' : ''}>Disponible</option>
      <option value="Unavailable" ${item.status === 'Unavailable' ? 'selected' : ''}>No disponible</option>
    </select>
    <div class="choices-wrapper">
      <select id="swal-tags" multiple>
        ${this.availableTags.map(tag => `
          <option value="${tag.tagId}" ${item.tags?.some(t => t.tagId === tag.tagId) ? 'selected' : ''}>
            ${tag.name}
          </option>
        `).join('')}
      </select>
    </div>
  `;

    Swal.fire({
      title: `Editar artículo: ${item.title}`,
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
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value.trim();
        const description = (document.getElementById('swal-description') as HTMLTextAreaElement).value.trim();
        const creditValue = +(document.getElementById('swal-credits') as HTMLInputElement).value;
        const type = (document.getElementById('swal-type') as HTMLSelectElement).value;
        const status = (document.getElementById('swal-status') as HTMLSelectElement).value;
        const tagSelect = document.getElementById('swal-tags') as HTMLSelectElement;
        const selectedTags: number[] = Array.from(tagSelect.selectedOptions).map(opt => +opt.value);

        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s'-]{3,100}$/;

        if (!title || !regex.test(title)) {
          Swal.showValidationMessage('El título debe tener entre 3 y 100 caracteres y no contener símbolos especiales.');
          return;
        }

        if (!description || description.length < 10 || description.length > 500) {
          Swal.showValidationMessage('La descripción debe tener entre 10 y 500 caracteres.');
          return;
        }

        const creditString = creditValue.toString();
        if (isNaN(creditValue) || creditValue <= 0 || creditString.length > 6) {
          Swal.showValidationMessage('Los créditos deben ser un número positivo de hasta 6 cifras.');
          return;
        }

        if (selectedTags.length === 0) {
          Swal.showValidationMessage('Debes seleccionar al menos una etiqueta.');
          return;
        }

        if (selectedTags.length === 0 || selectedTags.length > 3) {
          Swal.showValidationMessage('Debes seleccionar entre 1 y 3 etiquetas.');
          return;
        }

        return { title, description, creditValue, type, status, tags: selectedTags };
      },
      didOpen: () => {
        const tagSelectElement = document.getElementById('swal-tags') as HTMLSelectElement;
        if (tagSelectElement) {
          const choicesInstance = new Choices(tagSelectElement, {
            removeItemButton: true,
            placeholder: true,
            placeholderValue: 'Selecciona etiquetas',
            maxItemCount: 3
          });

          (window as any).swalChoicesInstance = choicesInstance;
        }
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const updated = result.value;
        const dto: ItemRequestDTO = {
          ...updated,
          tags: updated.tags,
          imageUrl: item.imageUrl
        };

        const updatedTagIds = updated.tags.sort().join(',');
        const originalTagIds = (item.tags?.map(t => t.tagId).sort().join(',')) ?? '';

        const noChanges =
          updated.title === item.title &&
          updated.description === item.description &&
          updated.creditValue === item.creditValue &&
          updated.status === item.status &&
          updated.type === item.type &&
          updatedTagIds === originalTagIds;

        if (noChanges) {
          Swal.fire({
            icon: 'info',
            title: 'Sin cambios detectados',
            text: 'No se ha modificado ningún dato del artículo.'
          });
          return;
        }

        this.itemService.updateItem(item.itemId, dto).subscribe({
          next: (updatedItem) => {
            const index = this.items.findIndex(i => i.itemId === item.itemId);
            if (index !== -1) this.items[index] = updatedItem;

            Swal.fire('Artículo actualizado', '', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No se pudo actualizar el artículo.', 'error');
          }
        });
      }
    });
  }


  showMoreItems(): void {
    this.visibleCount += 15;
  }

  showDescription(item: Item): void {
    Swal.fire({
      title: `<i class="bi bi-card-text me-2"></i> Descripción de "${item.title}"`,
      html: `<p class="text-start">${item.description || 'Sin descripción registrada.'}</p>`,
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

}
