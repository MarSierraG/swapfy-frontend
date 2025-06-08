import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user/user.service';
import { MessageService } from '../message.service';
import { User } from '../../../models/user.model';
import {NavbarWrapperComponent} from '../../../components/layout/navbar-wrapper/navbar-wrapper.component';
import {LoaderComponent} from '../../../components/shared/loader/loader.component';
import Swal from 'sweetalert2';
import { Renderer2, ElementRef } from '@angular/core';

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
    private router: Router,
    private renderer: Renderer2,
    private elRef: ElementRef
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    const isDark = localStorage.getItem('darkMode') === 'true';
    this.renderer[isDark ? 'addClass' : 'removeClass'](this.elRef.nativeElement, 'dark-mode');
    document.body.classList.toggle('dark-mode', isDark);


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


    this.userService.getAllUsers().subscribe({
      next: allUsers => {
        this.users = allUsers.filter(u => u.userId !== this.currentUserId);
        this.results = [];
        this.isLoading = false;
      },
      error: err => {
        console.error(' Error al obtener usuarios:', err);
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
      Swal.fire({
        icon: 'warning',
        title: 'Ups...',
        text: 'No puedes iniciar un chat contigo misma',
        confirmButtonColor: '#14b8a6'
      });
      return;
    }

    this.router.navigate(['/chats', userId]);
  }
}
