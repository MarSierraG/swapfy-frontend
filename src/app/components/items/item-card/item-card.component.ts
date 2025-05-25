import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../../models/item.model';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css']
})
export class ItemCardComponent {
  @Input() item!: Item;
  @Input() showOwner: boolean = false;

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

