import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class DarkModeService {
  private darkModeSubject = new BehaviorSubject<boolean>(this.getInitialValue());
  darkMode$ = this.darkModeSubject.asObservable();

  constructor(private router: Router) {}

  private getInitialValue(): boolean {
    return localStorage.getItem('darkMode') === 'true';
  }

  toggle(): void {
    const current = !this.darkModeSubject.value;
    this.darkModeSubject.next(current);
    localStorage.setItem('darkMode', current.toString());
    document.body.classList.toggle('dark-mode', current);

    // Forzar recarga solo si estamos en /chats o similares
    const url = this.router.url;
    if (url.startsWith('/chats')) {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigateByUrl(url);
      });
    }
  }

  sync(): void {
    const current = this.getInitialValue();
    this.darkModeSubject.next(current);
    document.body.classList.toggle('dark-mode', current);
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }
}
