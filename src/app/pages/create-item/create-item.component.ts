import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ItemRequestDTO } from '../../models/item-request.dto';
import { ItemService } from '../../services/item/item.service';
import { CommonModule } from '@angular/common';
import { NavbarWrapperComponent } from '../../components/layout/navbar-wrapper/navbar-wrapper.component';
import { ItemFormComponent } from '../../components/items/item-form/item-form.component';
import { HttpClient } from '@angular/common/http';
import { ItemFormPayload } from '../../components/items/item-form/item-form.component';
import {LoaderComponent} from '../../components/shared/loader/loader.component';


@Component({
  standalone: true,
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  imports: [CommonModule, NavbarWrapperComponent, ItemFormComponent, LoaderComponent],
})
export class CreateItemComponent implements OnInit {
  tagsDisponibles: { tagId: number; name: string }[] = [];
  mensaje: string = '';
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  isLoading = false;




  constructor(
    private itemService: ItemService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemService.getTags().subscribe(tags => {
      this.tagsDisponibles = tags;
    });
  }




  async crearItem({ dto, file }: ItemFormPayload): Promise<void> {
    this.isLoading = true;

    try {
      if (file) {
        const imageUrl = await this.uploadImage(file);
        dto.imageUrl = imageUrl;
      }

      const userId = parseInt(localStorage.getItem('userId') || '0');
      const itemConUsuario = { ...dto, userId };

      this.itemService.createItem(itemConUsuario).subscribe({
        next: () => {
          this.mensaje = 'Artículo creado correctamente';
          this.router.navigate(['/store']);
          this.isLoading = false;
        },
        error: () => {
          this.mensaje = 'Error al crear el artículo.';
          this.isLoading = false;
        }
      });

    } catch (error) {
      console.error('Error al crear el artículo', error);
      this.mensaje = 'Error al crear el artículo. Intenta nuevamente.';
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

  onImagenSeleccionada(file: File | null) {
    this.selectedFile = file;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.imagePreviewUrl = reader.result as string;
      reader.readAsDataURL(file);
    } else {
      this.imagePreviewUrl = null;
    }
  }



}
