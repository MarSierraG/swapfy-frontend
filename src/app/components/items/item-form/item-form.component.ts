import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Item } from '../../../models/item.model';
import { ItemRequestDTO } from '../../../models/item-request.dto';
import { LoaderComponent } from '../../shared/loader/loader.component';
import Swal from 'sweetalert2';

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
export class ItemFormComponent implements OnInit, OnChanges {
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
  titleTouched = false;
  descriptionTouched = false;
  creditTouched = false;
  tagsTouched = false;
  imagenInvalida: boolean = false;


  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modo'] && this.modo === 'editar' && this.item) {
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
    this.mostrarErrores = true;

    this.titleTouched = true;
    this.descriptionTouched = true;
    this.creditTouched = true;
    this.tagsTouched = true;

    const regexTitulo = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s'-]+$/;
    const tituloValido =
      this.formItem.title.trim().length >= 3 &&
      regexTitulo.test(this.formItem.title.trim());

    const descripcionValida = this.formItem.description.trim().length >= 10;
    const creditosValidos =
      this.formItem.creditValue > 0 &&
      this.formItem.creditValue.toString().length <= 6;

    const etiquetasValidas = this.formItem.tags.length > 0;
    const imagenValida = this.modo === 'editar' || this.selectedImageFile !== null;
    const tipoValido = ['offer', 'demand'].includes(this.formItem.type);
    const estadoValido = ['Available', 'Unavailable'].includes(this.formItem.status);

    const camposValidos =
      tituloValido &&
      descripcionValida &&
      creditosValidos &&
      etiquetasValidas &&
      imagenValida &&
      tipoValido &&
      estadoValido;

    if (!camposValidos) return;

    if (this.modo === 'editar' && this.item) {
      const mismoTitulo = this.item.title === this.formItem.title.trim();
      const mismaDescripcion = this.item.description === this.formItem.description.trim();
      const mismosCreditos = this.item.creditValue === this.formItem.creditValue;
      const mismoTipo = this.item.type === this.formItem.type;
      const mismoEstado = this.item.status === this.formItem.status;
      const mismasTags = this.mismosArrays(
        this.item.tags?.map(t => t.tagId) || [],
        this.formItem.tags
      );
      const sinNuevaImagen = !this.selectedImageFile;

      const sinCambios =
        mismoTitulo &&
        mismaDescripcion &&
        mismosCreditos &&
        mismoTipo &&
        mismoEstado &&
        mismasTags &&
        sinNuevaImagen;

      if (sinCambios) {
        Swal.fire({
          icon: 'info',
          title: 'Sin cambios',
          text: 'No has modificado ningún campo del artículo.',
          confirmButtonColor: '#14b8a6'
        });
        return;
      }
    }

    this.guardar.emit({
      dto: this.formItem,
      file: this.selectedImageFile
    });
  }

  isTituloInvalido(): boolean {
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s'-]+$/;
    return this.formItem.title?.trim().length >= 3 &&
      !regex.test(this.formItem.title.trim());
  }


  onImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const archivo = input.files[0];
      const tiposValidos = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSizeMB = 5 * 1024 * 1024; // 5MB

      if (!tiposValidos.includes(archivo.type) || archivo.size > maxSizeMB) {
        this.imagenInvalida = true;
        this.selectedImageFile = null;
        this.nuevaImagenSeleccionada = null;
        return;
      }

      this.imagenInvalida = false;
      this.selectedImageFile = archivo;

      const reader = new FileReader();
      reader.onload = () => {
        this.nuevaImagenSeleccionada = reader.result as string;
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

    this.tagsTouched = true;
  }

  onCancelar() {
    this.cancelar.emit();
  }

  private mismosArrays(arr1: number[], arr2: number[]): boolean {
    if (arr1.length !== arr2.length) return false;
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    return sorted1.every((val, i) => val === sorted2[i]);
  }

  onCreditChange(valor: string) {
    const soloNumeros = valor.replace(/\D/g, '');
    const truncado = soloNumeros.slice(0, 6);
    this.formItem.creditValue = truncado ? parseInt(truncado, 10) : 0;
  }

  protected readonly HTMLInputElement = HTMLInputElement;
  protected readonly String = String;

  get isMaxTagsReached(): boolean {
    return this.formItem.tags.length >= 3;
  }

}

