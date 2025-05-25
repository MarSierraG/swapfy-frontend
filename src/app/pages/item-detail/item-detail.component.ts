import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../../services/item/item.service';
import { Item } from '../../models/item.model';
import { AuthService } from '../../services/auth/auth.service';
import { NavbarWrapperComponent } from '../../components/layout/navbar-wrapper/navbar-wrapper.component';
import {ItemFormComponent, ItemFormPayload} from '../../components/items/item-form/item-form.component';
import { HttpClient } from '@angular/common/http';
import { ItemRequestDTO } from '../../models/item-request.dto';
import Swal from 'sweetalert2';
import {LoaderComponent} from '../../components/shared/loader/loader.component';

@Component({
  standalone: true,
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.css'],
  imports: [CommonModule, NavbarWrapperComponent, ItemFormComponent, LoaderComponent]
})
export class ItemDetailComponent implements OnInit {
  item: Item | null = null;
  isOwnerOrAdmin = false;
  modoEdicion = false;
  tagsDisponibles: { tagId: number; name: string }[] = [];
  selectedFile: File | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.itemService.getItemById(id).subscribe({
      next: (data: Item) => {
        this.item = data;

        const currentUserId = this.authService.currentUserId();
        const roles = this.authService.getUserRoles();
        const isAdmin = roles.map(r => r.toUpperCase()).includes('ADMIN');

        this.isOwnerOrAdmin = data.userId === currentUserId || isAdmin;
      },
      error: () => this.router.navigate(['/store'])
    });


    this.itemService.getTags().subscribe(tags => {
      this.tagsDisponibles = tags;
    });
  }


  activarEdicion(): void {
    this.modoEdicion = true;
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.selectedFile = null;
  }

  async guardarCambios(event: { dto: ItemRequestDTO, file: File | null }) {
    this.isLoading = true;

    const { dto, file } = event;
    if (!this.item) return;

    try {
      if (file) {
        const imageUrl = await this.uploadImage(file);
        dto.imageUrl = imageUrl;
      } else {
        dto.imageUrl = this.item.imageUrl;
      }

      this.itemService.updateItem(this.item.itemId, dto).subscribe({
        next: (updated) => {
          this.item = {
            ...this.item!,
            ...updated,
            imageUrl: dto.imageUrl!
          };
          this.modoEdicion = false;
          this.selectedFile = null;
          this.isLoading = false;
        },
        error: () => {
          console.error('Error al actualizar');
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error en uploadImage', error);
      this.isLoading = false;
    }
  }





  private uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'swapfy_unsigned');

    return new Promise((resolve, reject) => {
      this.http.post('https://api.cloudinary.com/v1_1/dkssb35c9/image/upload', formData)
        .subscribe({
          next: (res: any) => resolve(res.secure_url),
          error: err => reject(err)
        });
    });
  }

  eliminar() {
    if (!this.item) return;

    const itemId = this.item.itemId;

    Swal.fire({
      title: '¿Eliminar artículo?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'darkcyan',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.itemService.deleteItem(itemId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Artículo eliminado!',
              text: 'El trueque ha sido eliminado correctamente.',
              showConfirmButton: false,
              timer: 1800,
              timerProgressBar: true,
              didOpen: () => {
                const container = Swal.getHtmlContainer();
                if (container) {
                  const b = container.querySelector('b');
                  if (b) b.textContent = 'eliminando...';
                }
              }
            });

            this.router.navigate(['/store']);
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el artículo.'
            });
          }
        });
      }
    });
  }

  translate(key: string): string {
    const map: Record<string, string> = {
      available: 'Disponible',
      unavailable: 'No disponible',
      offer: 'Oferta',
      demand: 'Demanda',
    };

    return map[key?.toLowerCase()] || key;
  }

}
