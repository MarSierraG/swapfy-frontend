import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ItemListComponent } from '../../components/items/item-list/item-list.component';
import { NavbarWrapperComponent } from '../../components/layout/navbar-wrapper/navbar-wrapper.component';

import { ItemService } from '../../services/item/item.service';
import { Item } from '../../models/item.model';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-store',
  standalone: true,
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css'],
  imports: [CommonModule, RouterModule, ItemListComponent, NavbarWrapperComponent]
})
export class StoreComponent implements OnInit {
  items: Item[] = [];
  userId = 0;
  isLoading = true;

  constructor(private itemService: ItemService, private auth: AuthService) {}

  ngOnInit(): void {
    this.userId = this.auth.currentUserId()!;

    this.itemService.getItemsByUserId(this.userId).subscribe({
      next: (data) => {
        this.items = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar artículos del usuario:', err);
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
