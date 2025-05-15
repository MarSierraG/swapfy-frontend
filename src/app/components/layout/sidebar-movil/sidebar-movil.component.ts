import { Component, Input} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';
import {AuthService} from '../../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar-movil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-movil.component.html',
  styleUrls: ['./sidebar-movil.component.css']
})

export class SidebarMovilComponent {
  menuOpen = false;
  isDarkMode = false;
  @Input() showHeader: boolean = false;
  @Input() hideHeader: boolean = false;

  constructor(public router: Router, public authService: AuthService) {}

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }
}
