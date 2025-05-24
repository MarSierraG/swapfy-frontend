import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Message, MessageService } from '../message.service';
import { UserService } from '../../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarWrapperComponent } from '../../../components/layout/navbar-wrapper/navbar-wrapper.component';
import { LoaderComponent } from '../../../components/shared/loader/loader.component';

@Component({
  standalone: true,
  selector: 'app-message-chat',
  templateUrl: './message-chat.component.html',
  styleUrls: ['./message-chat.component.css'],
  imports: [CommonModule, FormsModule, NavbarWrapperComponent, LoaderComponent],
})
export class MessageChatComponent implements OnInit {
  messages: Message[] = [];
  content = '';
  userId!: number;
  otherUserId!: number;
  isLoading = true;

  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;


  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const user = this.userService.getCurrentUser();
    if (!user) return;

    this.userId = user.userId;

    const param = this.route.snapshot.paramMap.get('id');
    if (!param) return;

    this.otherUserId = +param;

    if (this.otherUserId === this.userId) {
      alert('No puedes chatear contigo mism@');
      return;
    }

    this.loadConversation();
  }

  loadConversation(showLoader: boolean = true): void {
    if (showLoader) this.isLoading = true;

    this.messageService
      .getConversation(this.userId, this.otherUserId)
      .subscribe((messages: Message[]) => {
        this.messages = messages.sort((a, b) => (a.timestamp! > b.timestamp! ? 1 : -1));

        if (showLoader) this.isLoading = false;

        setTimeout(() => this.scrollToBottom(), 100);
      });
  }



  sendMessage(): void {
    if (!this.content.trim()) return;

    const message: Message = {
      senderUserId: this.userId,
      receiverUserId: this.otherUserId,
      content: this.content.trim(),
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
