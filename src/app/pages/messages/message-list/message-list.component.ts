import {Component, HostListener, OnInit} from '@angular/core';

import { Router } from '@angular/router';
import {NavbarWrapperComponent} from '../../../components/layout/navbar-wrapper/navbar-wrapper.component';
import {UserService} from '../../../services/user/user.service';
import {Message, MessageService} from '../message.service';
import {CommonModule} from '@angular/common';
import {LoaderComponent} from '../../../components/shared/loader/loader.component';
import {Renderer2, ElementRef } from '@angular/core';
import { DarkModeService } from '../../../services/darkmode/dark-mode.service';
import Swal from 'sweetalert2';


@Component({
  standalone: true,
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css'],
  imports: [
    NavbarWrapperComponent, CommonModule, LoaderComponent
  ]
})
export class MessageListComponent implements OnInit {
  userId!: number;
  messages: Message[] = [];
  conversations: { userId: number; name: string; lastMessage: string; lastTimestamp: number }[] = [];
  isLoading = true;
  unreadSummary: Record<number, number> = {};
  isDarkMode = false;

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private router: Router,
    private renderer: Renderer2,
    private elRef: ElementRef,
    public darkModeService: DarkModeService
  ) {}


  async ngOnInit() {
    this.isLoading = true;

    // Oscuro
    this.darkModeService.darkMode$.subscribe((isDark) => {
      document.body.classList.toggle('dark-mode', isDark);
    });

    const user = this.userService.getCurrentUser();
    if (!user) return;

    this.userId = user.userId;

    // Obtener resumen de mensajes no leídos
    this.messageService.getUnreadSummary(this.userId).subscribe(summary => {
      this.unreadSummary = summary;
    });

    // Obtener conversaciones visibles desde el backend
    this.messageService.getVisibleConversations().subscribe({
      next: async (users) => {
        const convoPromises = users.map(async (user) => {
          const msgs = await this.messageService.getConversation(this.userId, user.userId).toPromise();

          const sortedMsgs = msgs?.length
            ? msgs.sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
            : [];

          const last = sortedMsgs[0];  // último mensaje más reciente

          return {
            userId: user.userId,
            name: user.name,
            lastMessage: last?.content ?? '(sin mensajes)',
            lastTimestamp: last?.timestamp ? new Date(last.timestamp).getTime() : 0,
          };
        });


        const resolved = await Promise.all(convoPromises);

        this.conversations = resolved.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando conversaciones', err);
        this.isLoading = false;
      }
    });

  }



  openChat(otherUserId: number) {
    this.router.navigate(['/chats', otherUserId]);
  }

  startNewChat() {
    this.router.navigate(['/chats/new']);
  }

  hide(otherUserId: number) {
    Swal.fire({
      title: '¿Ocultar conversación?',
      text: 'Esta conversación desaparecerá de tu lista. Volverá a mostrarse si tú o la otra persona escribís un nuevo mensaje.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, ocultar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.messageService.hideConversation(otherUserId).subscribe({
          next: () => {
            this.conversations = this.conversations.filter(c => c.userId !== otherUserId);
            Swal.fire('Conversación ocultada', '', 'success');
          },
          error: (err) => {
            console.error('Error al ocultar conversación', err);
            Swal.fire('Error', 'No se pudo ocultar la conversación', 'error');
          }
        });
      }
    });
  }



}
