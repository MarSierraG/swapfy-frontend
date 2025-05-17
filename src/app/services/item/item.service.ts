import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../../models/item.model';
import { environment } from '../../../environments/environment';
import {ItemRequestDTO} from '../../models/item-request.dto';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = `${environment.apiUrl}/items`;

  constructor(private http: HttpClient) {}

  getAvailableItems(): Observable<Item[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Item[]>(this.apiUrl, { headers });
  }

  getItemsByUserId(userId: number) {
    return this.http.get<Item[]>(`${this.apiUrl}/user/${userId}`);
  }

  getItemById(id: number) {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }

  deleteItem(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateItem(id: number, dto: ItemRequestDTO): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}`, dto);
  }

  createItem(dto: any): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}`, dto);
  }

  getTags(): Observable<any[]> {
    const url = `${environment.apiUrl}/tags`;
    return this.http.get<any[]>(url);
  }


}
