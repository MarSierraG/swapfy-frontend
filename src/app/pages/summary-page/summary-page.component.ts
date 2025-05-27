import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarWrapperComponent } from '../../components/layout/navbar-wrapper/navbar-wrapper.component';
import { Router } from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';
import {CreditService} from '../../services/credits/credit.service';
import {ItemService} from '../../services/item/item.service';
import {MessageService} from '../messages/message.service';
import {environment} from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {Credit} from '../../models/credit.model';
import {MadridDatePipe} from '../../pipes/madrid-date.pipe';


@Component({
  standalone: true,
  selector: 'app-summary-page',
  templateUrl: './summary-page.component.html',
  styleUrls: ['./summary-page.component.css'],
  imports: [CommonModule, NavbarWrapperComponent, MadridDatePipe]
})
export class SummaryPageComponent implements OnInit {
  constructor(
    private creditService: CreditService,
    private authService: AuthService,
    private itemService: ItemService,
    private messageService: MessageService,
    private http: HttpClient,
    private router: Router
  ) {}

  totalSpentCredits: number = 0;
  totalPublishedItems: number = 0;
  conversationCount: number = 0;
  credits: Credit[] = [];


  ngOnInit(): void {
    const userId = this.authService.currentUserId();
    if (!userId) return;

    this.creditService.getTotalSpentCredits(userId).subscribe({
      next: (value) => this.totalSpentCredits = value,
      error: (err) => console.error('Error al cargar créditos gastados:', err)
    });

    this.itemService.getItemsByUser(userId).subscribe({
      next: (items) => this.totalPublishedItems = items.length,
      error: (err) => console.error('Error al cargar artículos publicados:', err)
    });

    this.messageService.getUniqueConversationCount(userId).subscribe({
      next: (count) => this.conversationCount = count,
      error: (err) => console.error('Error al cargar conversaciones:', err)
    });

    this.creditService.getAllCreditsByUser(userId).subscribe({
      next: (credits) => this.credits = credits,
      error: (err) => console.error('Error al cargar historial de créditos:', err)
    });

  }

  downloadExtract(): void {
    const userId = this.authService.currentUserId();
    const url = `${environment.apiUrl}/credits/extract/${userId}`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'extracto_creditos_swapfy.pdf';
        a.click();
      },
      error: (err: any) => {
        console.error('Error al descargar el PDF:', err);
        // Puedes mostrar un Swal aquí si quieres
      }
    });
  }




  goBack(): void {
    this.router.navigate(['/settings']);
  }
}
