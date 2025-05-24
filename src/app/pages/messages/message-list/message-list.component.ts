import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import {NavbarWrapperComponent} from '../../../components/layout/navbar-wrapper/navbar-wrapper.component';
import {UserService} from '../../../services/user/user.service';
import {Message, MessageService} from '../message.service';
import {CommonModule} from '@angular/common';
import {LoaderComponent} from '../../../components/shared/loader/loader.component';

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

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.isLoading = true;

    const user = this.userService.getCurrentUser();
    if (!user) return;

    this.userId = user.userId;

    const sent = (await this.messageService.getMessagesSentBy(this.userId).toPromise()) ?? [];
    const received = (await this.messageService.getMessagesReceivedBy(this.userId).toPromise()) ?? [];

    const all = [...sent, ...received];

    // Agrupamos por el otro usuario (no por uno mismo)
    const grouped: { [key: number]: Message[] } = {};
    all.forEach(msg => {
      const otherId = msg.senderUserId === this.userId ? msg.receiverUserId : msg.senderUserId;
      if (!grouped[otherId]) grouped[otherId] = [];
      grouped[otherId].push(msg);
    });

    const conversationPromises = Object.entries(grouped).map(async ([otherId, msgs]) => {
      try {
        const user = await this.userService.getUserById(+otherId).toPromise();

        const sortedMsgs = msgs.sort((a, b) => (a.timestamp! > b.timestamp! ? -1 : 1));
        const lastMessage = sortedMsgs[0].content;
        const lastTimestamp = new Date(sortedMsgs[0].timestamp!).getTime();

        return {
          userId: +otherId,
          name: user?.name ?? `Usuario ${otherId}`,
          lastMessage,
          lastTimestamp
        };
      } catch (error) {
        console.warn(`No se encontró el usuario con ID ${otherId}`);
        return null;
      }
    });

    const rawResults = await Promise.all(conversationPromises);

    // Ordenamos por la fecha del último mensaje
    this.conversations = (rawResults.filter(Boolean) as typeof this.conversations)
      .sort((a, b) => b.lastTimestamp - a.lastTimestamp);

    this.isLoading = false;
  }

  openChat(otherUserId: number) {
    this.router.navigate(['/chats', otherUserId]);
  }

  startNewChat() {
    this.router.navigate(['/chats/new']);
  }
}
