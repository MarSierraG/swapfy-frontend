import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user/user.service';
import { MessageService } from '../message.service';
import { User } from '../../../models/user.model';
import {NavbarWrapperComponent} from '../../../components/layout/navbar-wrapper/navbar-wrapper.component';
import {LoaderComponent} from '../../../components/shared/loader/loader.component';

@Component({
  selector: 'app-start-chat',
  standalone: true,
  templateUrl: './start-chat.component.html',
  styleUrls: ['./start-chat.component.css'],
  imports: [CommonModule, FormsModule, NavbarWrapperComponent, LoaderComponent],
})
export class StartChatComponent implements OnInit {
  searchTerm = '';
  users: User[] = [];
  recentUsers: User[] = [];
  results: User[] = [];
  currentUserId!: number;
  isLoading = true;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.isLoading = true;

    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) return;

    this.currentUserId = currentUser.userId;

    const sent = await this.messageService.getMessagesSentBy(this.currentUserId).toPromise() ?? [];
    const received = await this.messageService.getMessagesReceivedBy(this.currentUserId).toPromise() ?? [];

    const all = [...sent, ...received];

    const uniqueUserIds = Array.from(
      new Set(all.map(msg =>
        msg.senderUserId === this.currentUserId ? msg.receiverUserId : msg.senderUserId
      ))
    );

    const recentUserPromises = uniqueUserIds.map(id => this.userService.getUserById(id).toPromise());
    const recentResults = await Promise.all(recentUserPromises);
    this.recentUsers = recentResults.filter(Boolean) as User[];

    // Get all users excluding current
    this.userService.getAllUsers().subscribe({
      next: allUsers => {
        this.users = allUsers.filter(u => u.userId !== this.currentUserId);
        this.results = [];
        this.isLoading = false;
      },
      error: err => {
        console.error('❌ Error al obtener usuarios:', err);
        this.isLoading = false;
      }
    });
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase();
    if (!term.trim()) {
      this.results = [];
      return;
    }

    this.results = this.users.filter(
      u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }

  hasChatWith(userId: number): boolean {
    return this.recentUsers.some(u => u.userId === userId);
  }

  startChat(userId: number) {
    if (userId === this.currentUserId) {
      alert("No puedes iniciar un chat contigo misma 🙃");
      return;
    }

    this.router.navigate(['/chats', userId]);
  }
}
