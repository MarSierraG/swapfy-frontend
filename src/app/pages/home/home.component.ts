import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ItemService } from '../../services/item/item.service';
import { Item } from '../../models/item.model';
import { ItemListComponent } from '../../components/items/item-list/item-list.component';
import { NavbarWrapperComponent } from '../../components/layout/navbar-wrapper/navbar-wrapper.component';

import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, RouterModule, ItemListComponent, NavbarWrapperComponent]
})
export class HomeComponent implements OnInit {
  userName = '';
  items: Item[] = [];
  isLoading = true;
  searchTerm: string = '';
  filteredItems: Item[] = [];
  searchField: string = 'title';



  constructor(private itemService: ItemService, private auth: AuthService) {}

  ngOnInit(): void {
    console.log('¿Es admin?', this.auth.isAdmin());
    this.userName = this.auth.currentUserName() ?? 'Usuario';
    const myId = this.auth.currentUserId();

    this.itemService.getAvailableItems().subscribe({
      next: (data) => {
        this.items = myId ? data.filter((i) => i.userId !== myId) : data;
        this.isLoading = false;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error al cargar artículos:', err);
        this.isLoading = false;
      }
    });
  }

  loadItems(): void {
    this.isLoading = true;
    const myId = this.auth.currentUserId();

    this.itemService.getAvailableItems().subscribe({
      next: (data) => {
        this.items = myId ? data.filter((i) => i.userId !== myId) : data;
        this.isLoading = false;
        this.applyFilter();
      },
      error: (err) => {
        if (err.status !== 401) {
          console.error('Error al recargar artículos:', err);
          this.isLoading = false;
        }
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredItems = this.items;
      return;
    }

    this.filteredItems = this.items.filter(item => {
      const field = this.searchField;

      if (field === 'title') {
        return item.title.toLowerCase().includes(term);
      } else if (field === 'description') {
        return item.description.toLowerCase().includes(term);
      } else if (field === 'userName') {
        return item.userName.toLowerCase().includes(term);
      } else if (field === 'tagNames') {
        return item.tagNames.some(tag => tag.toLowerCase().includes(term));
      }

      return false;
    });
  }


  onSearchChanged({ term, field }: { term: string; field: string }): void {
    this.searchTerm = term;
    this.searchField = field;
    this.applyFilter();
  }

}
