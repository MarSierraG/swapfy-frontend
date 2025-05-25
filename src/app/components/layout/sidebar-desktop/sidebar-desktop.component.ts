import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {AuthService} from '../../../services/auth/auth.service';
import {MessageService} from '../../../pages/messages/message.service';
import {DarkModeService} from '../../../services/darkmode/dark-mode.service';

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

  hasUnreadMessages = false;
  isDarkMode = false;

  constructor(public authService: AuthService,
              private messageService: MessageService,
              public router: Router,
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

  toggleDarkMode(): void {
    this.darkModeService.toggle();
  }

  isInChats(): boolean {
    return this.router.url.startsWith('/chats');
  }
}
