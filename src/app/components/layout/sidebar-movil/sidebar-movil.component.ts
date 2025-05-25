import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { MessageService } from '../../../pages/messages/message.service';
import { DarkModeService } from '../../../services/darkmode/dark-mode.service';

@Component({
  selector: 'app-sidebar-movil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-movil.component.html',
  styleUrls: ['./sidebar-movil.component.css']
})
export class SidebarMovilComponent {
  @Input() showHeader: boolean = false;
  @Input() hideHeader: boolean = false;
  menuOpen = false;
  hasUnreadMessages = false;
  isDarkMode = false;

  constructor(
    public router: Router,
    public authService: AuthService,
    private messageService: MessageService,
    public darkModeService: DarkModeService
  ) {}

  ngOnInit(): void {
    this.isDarkMode = this.darkModeService.isDarkMode();
    this.darkModeService.darkMode$.subscribe(mode => {
      this.isDarkMode = mode;
    });

    const userId = this.authService.currentUserId();
    if (!userId) return;

    this.messageService.getUnreadSummary(userId).subscribe(summary => {
      const total = Object.values(summary).reduce((a, b) => a + b, 0);
      this.hasUnreadMessages = total > 0;
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  toggleDarkMode(): void {
    this.darkModeService.toggle();
  }

  isInChats(): boolean {
    return this.router.url.startsWith('/chats');
  }
}
