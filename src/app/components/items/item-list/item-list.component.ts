import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../../models/item.model';
import { ItemCardComponent } from '../item-card/item-card.component';
import {LoaderComponent} from '../../shared/loader/loader.component';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, ItemCardComponent, LoaderComponent, RouterLink],
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent {
  @Input() items: Item[] = [];
  @Input() showOwner: boolean = false;
  @Input() isLoading: boolean = true;
  @Input() onReload?: () => void;
  @Input() searchTerm: string = '';
  @Input() searchField: string = 'title';
  @Input() isViewingOwnStore: boolean = true;


}

