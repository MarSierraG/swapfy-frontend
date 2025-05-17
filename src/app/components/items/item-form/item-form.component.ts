import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Item } from '../../../models/item.model';
import { ItemRequestDTO } from '../../../models/item-request.dto';
import {LoaderComponent} from '../../shared/loader/loader.component';


export type ItemFormPayload = {
  dto: ItemRequestDTO;
  file: File | null;
};
@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.css']
})
export class ItemFormComponent {
  @Input() modo: 'crear' | 'editar' = 'crear';
  @Input() item?: Item;
  @Input() tagsDisponibles: { tagId: number; name: string }[] = [];
  @Input() mostrarErrores: boolean = false;
  @Input() isLoading: boolean = false;

  @Output() guardar = new EventEmitter<ItemFormPayload>();
  @Output() imagenSeleccionada = new EventEmitter<File | null>();
  @Output() cancelar = new EventEmitter<void>();

  formItem: ItemRequestDTO = {
    title: '',
    description: '',
    creditValue: 0,
    status: 'Available',
    type: 'offer',
    tags: []
  };

  selectedImageFile: File | null = null;
  nuevaImagenSeleccionada: string | null = null;

  ngOnInit() {
    if (this.item && this.modo === 'editar') {
      this.formItem = {
        title: this.item.title,
        description: this.item.description,
        creditValue: this.item.creditValue,
        status: this.item.status,
        type: this.item.type,
        tags: this.item.tags?.map(t => t.tagId) || [],
        imageUrl: this.item.imageUrl || ''
      };
    }
  }

  onGuardar() {
    const camposValidos =
      this.formItem.title.trim().length > 0 &&
      this.formItem.description.trim().length > 0 &&
      this.formItem.creditValue > 0 &&
      this.formItem.tags.length > 0 &&
      (this.modo === 'editar' || this.selectedImageFile !== null);

    if (!camposValidos) {
      this.mostrarErrores = true;
      return;
    }

    this.guardar.emit({
      dto: this.formItem,
      file: this.selectedImageFile
    });
  }

  onImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const archivo = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.nuevaImagenSeleccionada = reader.result as string;
        this.selectedImageFile = archivo;
        this.imagenSeleccionada.emit(archivo);
      };
      reader.readAsDataURL(archivo);
    }
  }

  onTagCheckboxChange(event: Event, tagId: number) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.formItem.tags.push(tagId);
    } else {
      this.formItem.tags = this.formItem.tags.filter(id => id !== tagId);
    }
  }

  onCancelar() {
    this.cancelar.emit();
  }

  protected readonly HTMLInputElement = HTMLInputElement;
}
