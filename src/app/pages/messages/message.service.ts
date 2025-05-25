import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment';

export interface Message {
  messageId?: number;
  senderUserId: number;
  receiverUserId: number;
  content: string;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private API_URL = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  sendMessage(message: Message): Observable<Message> {
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    return this.http.post<Message>(this.API_URL, message, { headers });
  }

  getConversation(userId1: number, userId2: number): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.API_URL}/conversation?user1=${userId1}&user2=${userId2}`
    );
  }

  getMessagesSentBy(userId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.API_URL}/sender/${userId}`);
  }

  getMessagesReceivedBy(userId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.API_URL}/receiver/${userId}`);
  }

  getUnreadSummary(userId: number): Observable<{ [senderId: number]: number }> {
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    return this.http.get<{ [senderId: number]: number }>(
      `${this.API_URL}/unread-summary/${userId}`,
      { headers }
    );
  }

  markAsRead(senderId: number, receiverId: number) {
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    return this.http.put(
      `${this.API_URL}/mark-as-read?senderId=${senderId}&receiverId=${receiverId}`,
      {},
      { headers }
    );
  }
}
