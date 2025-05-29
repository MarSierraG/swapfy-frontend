import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../components/shared/loader/loader.component';
import { NavbarWrapperComponent } from '../../components/layout/navbar-wrapper/navbar-wrapper.component';
import { UserService } from '../../services/user/user.service';
import Swal from 'sweetalert2';
import {MessageService} from '../messages/message.service';

@Component({
  standalone: true,
  selector: 'app-messages-admin-user',
  templateUrl: './messages-admin-user.component.html',
  styleUrls: ['./messages-admin-user.component.css'],
  imports: [CommonModule, NavbarWrapperComponent, LoaderComponent]
})
export class MessagesAdminUserComponent implements OnInit {
  userId!: number;
  conversations: { userId: number; name: string; lastMessage: string; lastTimestamp: number }[] = [];
  isLoading = true;
  unreadSummary: Record<number, number> = {};

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('id')!;
    this.isLoading = true;

    this.messageService.getUnreadSummary(this.userId).subscribe(summary => {
      this.unreadSummary = summary;
    });

    this.messageService.getVisibleConversationsForAdmin(this.userId).subscribe({
      next: async (users) => {
        const convoPromises = users.map(async (user) => {
          const msgs = await this.messageService.getConversation(this.userId, user.userId).toPromise();

          const sortedMsgs = msgs?.length
            ? msgs.sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
            : [];

          const last = sortedMsgs[0];

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
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openChatWithUser(targetUserId: number) {
    this.router.navigate(['/admin/messages-admin/conversation', this.userId, targetUserId]);
  }

  deleteConversation(targetUserId: number) {
    Swal.fire({
      title: '¿Eliminar conversación?',
      text: 'Esta acción eliminará todos los mensajes entre este usuario y la otra persona. ¿Seguro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.messageService.deleteConversation(this.userId, targetUserId).subscribe({
          next: () => {
            this.conversations = this.conversations.filter(c => c.userId !== targetUserId);
            Swal.fire('Eliminada', 'La conversación ha sido eliminada correctamente.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la conversación', 'error');
          }
        });
      }
    });
  }
}
