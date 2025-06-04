import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ItemListComponent } from '../../components/items/item-list/item-list.component';
import { NavbarWrapperComponent } from '../../components/layout/navbar-wrapper/navbar-wrapper.component';

import { ItemService } from '../../services/item/item.service';
import { Item } from '../../models/item.model';
import { AuthService } from '../../services/auth/auth.service';
import {UserService} from '../../services/user/user.service';
import {LoaderComponent} from '../../components/shared/loader/loader.component';
import {FooterComponent} from "../../components/layout/footer/footer.component";
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-store',
  standalone: true,
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css'],
    imports: [CommonModule, RouterModule, ItemListComponent, NavbarWrapperComponent, LoaderComponent, FooterComponent]
})

export class StoreComponent implements OnInit {
  items: Item[] = [];
  userId = 0;
  isLoading = true;
  searchTerm: string = '';
  filteredItems: Item[] = [];
  searchField: string = 'title';
  externalUserEmail: string | null = null;
  externalUserName: string | null = null;
  isViewingOwnStore = true;
  isSearchingExternalUser = false;


  constructor(
    private itemService: ItemService,
    private auth: AuthService,
    private userService: UserService,
    private route: ActivatedRoute ) {}

  ngOnInit(): void {
    this.userId = this.auth.currentUserId()!;

    this.route.queryParamMap.subscribe(params => {
      const email = params.get('email');
      if (email) {
        // Redirigido desde item-detail
        this.onSearchChanged({ term: email, field: 'email' });
      } else {

        this.itemService.getItemsByUserId(this.userId).subscribe({
          next: (data) => {
            this.items = data;
            this.applyFilter();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error al cargar artículos del usuario:', err);
            this.isLoading = false;
          }
        });
      }
    });
  }


  logout(): void {
    this.auth.logout();
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

    if (this.searchField === 'email') {
      this.isSearchingExternalUser = true;

      this.userService.getUserByEmail(term).subscribe(user => {
        if (user) {
          this.externalUserEmail = user.email;
          this.externalUserName = user.name;
          this.isViewingOwnStore = user.userId === this.userId;

          this.itemService.getItemsByUserId(user.userId).subscribe({
            next: (data) => {
              this.items = data;
              this.filteredItems = data;
              this.isLoading = false;
              this.isSearchingExternalUser = false;
            },
            error: (err) => {
              console.error('Error cargando artículos del email:', err);
              this.isLoading = false;
              this.isSearchingExternalUser = false;
            }
          });
        } else {
          this.items = [];
          this.filteredItems = [];
          this.externalUserEmail = null;
          this.externalUserName = null;
          this.isViewingOwnStore = false;
          this.isLoading = false;
          this.isSearchingExternalUser = false;
        }
      });
    } else {
      this.externalUserEmail = null;
      this.externalUserName = null;
      this.isViewingOwnStore = true;
      this.isSearchingExternalUser = false;

      this.itemService.getItemsByUserId(this.userId).subscribe({
        next: (data) => {
          this.items = data;
          this.applyFilter();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al volver a cargar tus artículos:', err);
          this.isLoading = false;
        }
      });
    }


  }



}
