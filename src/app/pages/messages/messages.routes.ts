import { Routes } from '@angular/router';
import { MessageListComponent } from './message-list/message-list.component';
import { MessageChatComponent } from './message-chat/message-chat.component';
import { StartChatComponent } from './start-chat/start-chat.component'; // ✅ importar esto

export const MESSAGES_ROUTES: Routes = [
  {
    path: '',
    component: MessageListComponent,
  },
  {
    path: 'new',
    component: StartChatComponent,
  },
  {
    path: ':id',
    component: MessageChatComponent,
  },
];
