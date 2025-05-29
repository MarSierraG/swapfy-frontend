import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user/user.service';
import { User } from '../../../models/user.model';
import Swal from 'sweetalert2';
import { LoaderComponent } from '../../../components/shared/loader/loader.component';
import { NavbarWrapperComponent } from '../../../components/layout/navbar-wrapper/navbar-wrapper.component';
import { MadridDatePipe } from '../../../pipes/madrid-date.pipe';
import {RouterLink} from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-messages',
  templateUrl: './message-chat.component.html',
  styleUrls: ['./message-chat.component.css'],
  imports: [CommonModule, FormsModule, LoaderComponent, NavbarWrapperComponent, MadridDatePipe, RouterLink]
})
export class MessagesComponent implements OnInit {
  users: User[] = [];
  selectedFilter: string = 'name';
  searchValue: string = '';
  visibleCount = 15;
  isLoading = true;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get filteredUsers(): User[] {
    const term = this.searchValue.toLowerCase();
    return this.users.filter(user => {
      switch (this.selectedFilter) {
        case 'id': return user.userId.toString().includes(term);
        case 'name': return user.name.toLowerCase().includes(term);
        case 'email': return user.email.toLowerCase().includes(term);
        default: return true;
      }
    });
  }

  showMoreUsers(): void {
    this.visibleCount += 15;
  }
}
