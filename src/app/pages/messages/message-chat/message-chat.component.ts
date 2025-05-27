import {Component, OnInit, ViewChild, ElementRef, Renderer2} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { Message, MessageService } from '../message.service';
import { UserService } from '../../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarWrapperComponent } from '../../../components/layout/navbar-wrapper/navbar-wrapper.component';
import { LoaderComponent } from '../../../components/shared/loader/loader.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import {Subscription} from 'rxjs';
import {MadridDatePipe} from '../../../pipes/madrid-date.pipe';


@Component({
  standalone: true,
  selector: 'app-message-chat',
  templateUrl: './message-chat.component.html',
  styleUrls: ['./message-chat.component.css'],
  imports: [CommonModule, FormsModule, MatSnackBarModule, NavbarWrapperComponent, LoaderComponent, MadridDatePipe],
})
export class MessageChatComponent implements OnInit {
  messages: Message[] = [];
  content = '';
  userId!: number;
  otherUserId!: number;
  isLoading = true;
  maxLength = 500;
  private routeSub!: Subscription;


  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private renderer: Renderer2,
    private elRef: ElementRef

  ) {}

  ngOnInit(): void {
    const isDark = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', isDark);

    const user = this.userService.getCurrentUser();
    if (!user) return;

    this.userId = user.userId;

    const param = this.route.snapshot.paramMap.get('id');
    if (!param) return;

    this.otherUserId = +param;

    if (this.otherUserId === this.userId) {
      Swal.fire({
        icon: 'warning',
        title: 'No permitido',
        text: 'No puedes chatear contigo mism@',
        confirmButtonColor: '#14b8a6'
      }).then(() => {
        this.router.navigate(['/chats']);
      });
      return;
    }


    this.messageService.markAsRead(this.otherUserId, this.userId).subscribe(() => {
      this.loadConversation();
    });
  }


  loadConversation(showLoader: boolean = true): void {
    if (showLoader) this.isLoading = true;

    this.messageService
      .getConversation(this.userId, this.otherUserId)
      .subscribe((messages: Message[]) => {
        this.messages = messages.sort((a, b) =>
          new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime()
        );


        if (showLoader) this.isLoading = false;

        setTimeout(() => this.scrollToBottom(), 100);
      });

  }


  sendMessage(): void {
    const trimmed = this.content.trim();

    if (!trimmed) {
      Swal.fire({
        icon: 'warning',
        title: 'Mensaje vacío',
        text: 'El mensaje no puede estar vacío.',
        confirmButtonColor: '#14b8a6'
      });
      return;
    }

    if (trimmed.length > this.maxLength) {
      Swal.fire({
        icon: 'warning',
        title: 'Demasiado largo',
        text: 'Has superado el límite de 500 caracteres.',
        confirmButtonColor: '#14b8a6'
      });
      return;
    }

    const message: Message = {
      senderUserId: this.userId,
      receiverUserId: this.otherUserId,
      content: trimmed,
    };

    this.messageService.sendMessage(message).subscribe(() => {
      this.content = '';
      setTimeout(() => this.messageInput.nativeElement.focus(), 100);
      this.loadConversation(false);
    });
  }


  scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop =
        this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.warn('No se pudo hacer scroll', err);
    }
  }
}
