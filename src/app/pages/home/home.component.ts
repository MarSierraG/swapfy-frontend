import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    CommonModule,
    SidebarComponent
  ]
})

export class HomeComponent implements OnInit {
  userName: string = '';
  items: Item[] = [];
  menuOpen: boolean = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      alert(' No estás logueado. Redirigiendo al login...');
      window.location.href = '/login';
      return;
    }

    this.userName = localStorage.getItem('userName') || 'Usuario';

    // Cargar artículos disponibles
    this.itemService.getAvailableItems().subscribe({
      next: (data) => {
        this.items = data;
        console.log('Artículos disponibles:', data);
      },
      error: (err) => {
        console.error('Error al cargar artículos:', err);
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    alert('Has cerrado sesión. ¡Hasta pronto!');
    window.location.href = '/login';
  }
}
