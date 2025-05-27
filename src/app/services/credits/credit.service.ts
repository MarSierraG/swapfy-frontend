import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment';
import {Credit} from '../../models/credit.model';



@Injectable({ providedIn: 'root' })
export class CreditService {
  private baseUrl = `${environment.apiUrl}/credits`;

  constructor(private http: HttpClient) {}

  registrarGasto(data: { userId: number, amount: number, type: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, data);
  }

  getTotalSpentCredits(userId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/spent-total/${userId}`);
  }

  getAllCreditsByUser(userId: number) {
    return this.http.get<Credit[]>(`${environment.apiUrl}/credits/user/${userId}`);
  }

  getAllCredits(): Observable<Credit[]> {
    return this.http.get<Credit[]>(`${this.baseUrl}`);
  }

  updateCredit(id: number, data: Partial<Credit>) {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteCredit(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }


}
