import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewChecked
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Message, MessageService } from '../message.service';
import { UserService } from '../../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarWrapperComponent } from '../../../components/layout/navbar-wrapper/navbar-wrapper.component';
import { LoaderComponent } from '../../../components/shared/loader/loader.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { MadridDatePipe } from '../../../pipes/madrid-date.pipe';
import { ItemCardComponent } from '../../../components/items/item-card/item-card.component';
import { Item } from '../../../models/item.model';
import { ItemService } from '../../../services/item/item.service';
import { NgZone,  AfterViewInit,  ChangeDetectorRef, } from '@angular/core';


@Component({
  standalone: true,
  selector: 'app-message-chat',
  templateUrl: './message-chat.component.html',
  styleUrls: ['./message-chat.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    NavbarWrapperComponent,
    LoaderComponent,
    MadridDatePipe,
    ItemCardComponent
  ]
})
export class MessageChatComponent implements OnInit, AfterViewInit {
  messages: Message[] = [];
  content = '';
  userId!: number;
  otherUserId!: number;
  isLoading = true;
  maxLength = 500;
  itemsInChat: Item[] = [];
  private lastMessageId: number | null = null;
  private pollingInterval: any;
  private messageSound = new Audio('assets/sounds/message.mp3');





  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private renderer: Renderer2,
    private elRef: ElementRef,
    private itemService: ItemService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.pollingInterval = setInterval(() => {
      this.checkForUpdates();
    }, 5000);

    const isDark = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', isDark);

    const user = this.userService.getCurrentUser();
    if (!user) return;

    this.userId = user.userId;

    const param = this.route.snapshot.paramMap.get('id');

    if (!param || isNaN(+param)) {
      Swal.fire({
        icon: 'error',
        title: 'ID inválido',
        text: 'La conversación no se puede cargar.',
        confirmButtonColor: '#14b8a6'
      }).then(() => {
        this.router.navigate(['/chats']);
      });
      return;
    }

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

    this.userService.getUserById(this.otherUserId).subscribe({
      next: (usuarioEncontrado) => {
        if (!usuarioEncontrado) {
          throw new Error('No existe');
        }

        this.messageService.markAsRead(this.otherUserId, this.userId).subscribe(() => {
          this.loadConversation();
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Usuario no encontrado',
          text: 'El usuario con el que intentas chatear no existe.',
          confirmButtonColor: '#14b8a6'
        }).then(() => {
          this.router.navigate(['/chats']);
        });
      }
    });
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }


  checkForUpdates(): void {
    this.messageService
      .getConversation(this.userId, this.otherUserId)
      .subscribe((messages: Message[]) => {
        const sorted = messages.sort(
          (a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime()
        );

        const last = sorted.at(-1);

        if (!this.lastMessageId || last?.messageId !== this.lastMessageId) {
          if (last?.senderUserId !== this.userId) {
            this.showNewMessageNotification();
          }

          this.loadConversation(false);
        }
      });
  }

  showNewMessageNotification(): void {
    //Reproducir sonido
    this.messageSound.play().catch(() => {
      console.warn('No se pudo reproducir el sonido');
    });
  }


  loadConversation(showLoader: boolean = true): void {
    if (showLoader) this.isLoading = true;

    this.messageService
      .getConversation(this.userId, this.otherUserId)
      .subscribe((messages: Message[]) => {
        this.messages = messages.sort(
          (a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime()
        );

        // ✅ Actualizamos el último mensaje recibido para el polling
        if (this.messages.length > 0) {
          this.lastMessageId = this.messages[this.messages.length - 1].messageId!;
        }

        // Prepara todas las promesas de carga de ítems
        const loadingItems: Promise<void>[] = [];

        this.messages.forEach(msg => {
          const itemId = this.extractItemId(msg.content);
          const yaCargado = this.itemsInChat.some(i => i.itemId === itemId);

          if (itemId && !yaCargado) {
            const promesa = new Promise<void>(resolve => {
              this.itemService.getItemById(itemId).subscribe({
                next: (item) => {
                  this.itemsInChat.push(item);
                  resolve();
                },
                error: () => {
                  console.warn(`Item con ID ${itemId} no encontrado (posiblemente eliminado)`);
                  resolve();
                }
              });
            });

            loadingItems.push(promesa);
          }
        });

        Promise.all(loadingItems).then(() => {
          if (showLoader) this.isLoading = false;

          setTimeout(() => {
            this.scrollToBottom();
          }, 150);
        });
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
      content: trimmed
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

  isItemMessage(content: string): boolean {
    try {
      const obj = JSON.parse(content);
      return obj.type === 'item';
    } catch {
      return false;
    }
  }

  getItemText(content: string): string {
    try {
      const obj = JSON.parse(content);
      return obj.message || '';
    } catch {
      return '';
    }
  }

  getItemFromMessage(content: string): Item | null {
    try {
      const obj = JSON.parse(content);
      return this.itemsInChat.find(i => i.itemId === obj.itemId) || null;
    } catch {
      return null;
    }
  }

  extractItemId(content: string): number | null {
    try {
      const obj = JSON.parse(content);
      return obj.type === 'item' ? obj.itemId : null;
    } catch {
      return null;
    }
  }
}
