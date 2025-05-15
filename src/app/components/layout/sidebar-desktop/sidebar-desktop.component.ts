import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {AuthService} from '../../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar-desktop',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-desktop.component.html',
  styleUrls: ['./sidebar-desktop.component.css']
})

export class SidebarDesktopComponent {
  @Input() topbarHidden = false;
  @Input() isSearchVisible = false;
  @Input() showHeader: boolean = false;
  @Input() hideHeader: boolean = false;

  constructor(public authService: AuthService) {}

  isDarkMode = false;
  dropdownOpen = false;

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }


}
