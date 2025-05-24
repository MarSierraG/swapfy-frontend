import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user/user.service';
import { MessageService } from '../message.service';
import { User } from '../../../models/user.model';
import {NavbarWrapperComponent} from '../../../components/layout/navbar-wrapper/navbar-wrapper.component';

@Component({
  selector: 'app-start-chat',
  standalone: true,
  templateUrl: './start-chat.component.html',
  styleUrls: ['./start-chat.component.css'],
  imports: [CommonModule, FormsModule, NavbarWrapperComponent],
})
export class StartChatComponent implements OnInit {
  searchTerm = '';
  users: User[] = [];
  filteredUsers: User[] = [];
  currentUserId!: number;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users.filter(u => u.userId !== this.currentUserId);
        this.filteredUsers = [...this.users];
      },
      error: (err) => {
        console.error(' Error al obtener usuarios:', err);
      }
    });
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(
      u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );

    console.log(' Resultado filtrado:', this.filteredUsers);
  }


  startChat(userId: number) {
    if (userId === this.currentUserId) {
      alert("No puedes iniciar un chat contigo misma 🙃");
      return;
    }

    this.router.navigate(['/chats', userId]);
  }
}
