import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {CommonModule} from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  styleUrls: ['./create-item.component.css']
})
export class CreateItemComponent {
  item = {
    title: '',
    description: '',
    creditValue: 0,
    type: 'offer',
    status: 'Available',
    tags: [] as (number | { tagId: number })[],
    imageUrl: '',
    userId: 0
  };

  mensaje: string = '';
  tagsDisponibles: any[] = [];
  selectedFileName: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get('http://localhost:1314/api/tags').subscribe((res: any) => {
      this.tagsDisponibles = res;
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'swapfy_unsigned');

      this.http.post(`https://api.cloudinary.com/v1_1/dkssb35c9/image/upload`, formData)
        .subscribe({
          next: (res: any) => {
            this.item.imageUrl = res.secure_url;
            console.log('Imagen subida', res.secure_url);
          },
          error: (err) => {
            console.error('Error subiendo imagen:', err);
          }
        });
    }
  }




  crearItem() {
    if (this.item.tags.length === 0 || !this.item.imageUrl) {
      this.mensaje = 'Debes subir una imagen y seleccionar al menos una etiqueta.';
      return;
    }

    const userId = parseInt(localStorage.getItem('userId') || '0');

    const itemToSend = {
      title: this.item.title,
      description: this.item.description,
      creditValue: this.item.creditValue,
      type: this.item.type,
      status: this.item.status,
      imageUrl: this.item.imageUrl,
      userId: userId,
      tags: this.item.tags.map(tag => typeof tag === 'object' ? tag.tagId : tag)
    };

    this.http.post('http://localhost:1314/api/items', itemToSend)
      .subscribe(res => {
        console.log('Artículo creado', res);
        this.mensaje = 'Artículo creado con éxito';
        this.router.navigate(['/store']);
      });
  }



  toggleTag(tagId: number, event: any) {
    if (event.target.checked) {
      this.item.tags.push(tagId);
    } else {
      this.item.tags = this.item.tags.filter(id => id !== tagId);
    }
  }



}
