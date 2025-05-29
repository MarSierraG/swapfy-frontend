import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CommonModule } from '@angular/common';
import {NavbarWrapperComponent} from '../../../components/layout/navbar-wrapper/navbar-wrapper.component';
import {LoaderComponent} from '../../../components/shared/loader/loader.component';
import {MadridDatePipe} from '../../../pipes/madrid-date.pipe';
import {Message, MessageService} from '../../messages/message.service';


@Component({
  standalone: true,
  selector: 'app-messages-admin-conversation',
  templateUrl: './messages-admin-conversation.component.html',
  styleUrls: ['./messages-admin-conversation.component.css'],
  imports: [
    CommonModule,
    NavbarWrapperComponent,
    LoaderComponent,
    MadridDatePipe
  ]
})
export class MessagesAdminConversationComponent implements OnInit {
  userId!: number;
  otherUserId!: number;
  messages: Message[] = [];
  isLoading = true;
  userNameB: string = 'Usuario B';

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('userId')!;
    this.otherUserId = +this.route.snapshot.paramMap.get('otherUserId')!;

    this.loadConversation();
  }

  loadConversation(): void {
    this.isLoading = true;

    this.messageService
      .getConversation(this.userId, this.otherUserId)
      .subscribe((messages) => {
        this.messages = messages.sort(
          (a, b) =>
            new Date(a.timestamp!).getTime() -
            new Date(b.timestamp!).getTime()
        );
        this.isLoading = false;
        setTimeout(() => this.scrollToBottom(), 100);
      });
  }

  scrollToBottom(): void {
    if (this.messageContainer) {
      try {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.warn('No se pudo hacer scroll', err);
      }
    }
  }


}
