import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagService } from '../../../services/tag/tag.service';
import { Tag } from '../../../models/tag.model';
import { LoaderComponent } from '../../../components/shared/loader/loader.component';
import { NavbarWrapperComponent } from '../../../components/layout/navbar-wrapper/navbar-wrapper.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarWrapperComponent, LoaderComponent],
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit {
  tags: Tag[] = [];
  isLoading = true;
  searchValue: string = '';
  searchField: 'name' | 'id' = 'name';

  constructor(private tagService: TagService) {}

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags(): void {
    this.isLoading = true;
    this.tagService.getAllTags().subscribe({
      next: (data) => {
        this.tags = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar etiquetas', err);
        this.isLoading = false;
      }
    });
  }

  get filteredTags(): Tag[] {
    const term = this.searchValue.trim().toLowerCase();

    if (!term) return this.tags;

    if (this.searchField === 'name') {
      return this.tags.filter(tag => tag.name.toLowerCase().includes(term));
    }

    if (this.searchField === 'id') {
      return this.tags.filter(tag => tag.tagId.toString().includes(term));
    }

    return this.tags;
  }


  openCreateModal(): void {
    Swal.fire({
      title: 'Nueva etiqueta',
      input: 'text',
      inputLabel: 'Nombre',
      inputPlaceholder: 'Introduce el nombre de la etiqueta',
      confirmButtonText: 'Crear',
      showCancelButton: true,
      inputValidator: (value) => {
        const trimmed = value.trim();
        if (!trimmed) return 'El nombre no puede estar vacío';
        if (trimmed.length < 2) return 'Debe tener al menos 2 caracteres';
        if (trimmed.length > 30) return 'Máximo 30 caracteres permitidos';
        if (!/^[\w\sáéíóúÁÉÍÓÚñÑ-]+$/.test(trimmed)) return 'Solo letras, espacios y guiones';
        return null;
      }
    }).then(result => {
      if (result.isConfirmed && result.value.trim()) {
        const name = result.value.trim();
        this.tagService.createTag({ name }).subscribe({
          next: (newTag) => {
            this.tags.push(newTag);
            Swal.fire('Etiqueta creada', '', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo crear la etiqueta', 'error')
        });
      }
    });
  }



  openEditModal(tag: Tag): void {
    Swal.fire({
      title: `Editar etiqueta`,
      input: 'text',
      inputValue: tag.name,
      inputPlaceholder: 'Nuevo nombre de etiqueta',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        const trimmed = value.trim();
        if (!trimmed) return 'El nombre no puede estar vacío';
        if (trimmed.length < 2) return 'Debe tener al menos 2 caracteres';
        if (trimmed.length > 30) return 'Máximo 30 caracteres permitidos';
        if (!/^[\w\sáéíóúÁÉÍÓÚñÑ-]+$/.test(trimmed)) return 'Solo letras, espacios y guiones';
        return null;
      },
      customClass: {
        confirmButton: 'btn btn-primary me-2',
        cancelButton: 'btn btn-outline-secondary'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const nuevoNombre = result.value.trim();

        if (nuevoNombre === tag.name) {
          Swal.fire({
            icon: 'info',
            title: 'Sin cambios',
            text: 'No se ha modificado el nombre de la etiqueta.',
            confirmButtonColor: '#14b8a6'
          });
          return;
        }

        this.tagService.updateTag(tag.tagId!, { name: nuevoNombre }).subscribe({
          next: () => {
            this.loadTags();
            Swal.fire('Etiqueta actualizada', '', 'success');
          },
          error: (err) => {
            if (err.status === 409) {
              Swal.fire({
                title: 'Etiqueta en uso',
                text: 'Esta etiqueta está siendo utilizada en artículos. ¿Deseas actualizarla de todos modos?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#aaa',
                confirmButtonText: 'Sí, actualizar',
                cancelButtonText: 'Cancelar'
              }).then((confirmResult) => {
                if (confirmResult.isConfirmed) {
                  this.tagService.updateTag(tag.tagId!, { name: nuevoNombre }, true).subscribe({
                    next: () => {
                      this.loadTags();
                      Swal.fire('Etiqueta actualizada', '', 'success');
                    },
                    error: () => {
                      Swal.fire('Error', 'No se pudo actualizar la etiqueta.', 'error');
                    }
                  });
                }
              });
            } else {
              Swal.fire('Error', 'No se pudo actualizar la etiqueta', 'error');
            }
          }
        });
      }
    });
  }




  confirmDelete(tag: Tag): void {
    Swal.fire({
      title: `¿Eliminar "${tag.name}"?`,
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
        this.tagService.deleteTag(tag.tagId).subscribe({
          next: () => {
            this.tags = this.tags.filter(t => t.tagId !== tag.tagId);
            Swal.fire('¡Eliminada!', 'La etiqueta ha sido eliminada.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar la etiqueta', 'error')
        });
      }
    });
  }
}
