// src/app/services/backend-loader.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BackendLoaderService {
  private visibleSubject = new BehaviorSubject<boolean>(false);
  visible$ = this.visibleSubject.asObservable();

  private pending = 0;
  private delayTimer: any = null;

  // Heurística “backend dormido”: si inactividad > 12 min, enseña sin delay
  private readonly coldInactivityMs = 12 * 60 * 1000;
  private readonly defaultDelayMs   = 500;
  private readonly minVisibleMs     = 600; // evita flash al ocultar
  private lastShownAt = 0;

  requestStarted() {
    this.pending++;
    const lastActive = Number(localStorage.getItem('lastApiOkAt') || 0);
    const inactiveMs = Date.now() - lastActive;
    const delay = inactiveMs > this.coldInactivityMs ? 0 : this.defaultDelayMs;

    if (this.delayTimer == null) {
      this.delayTimer = setTimeout(() => {
        this.delayTimer = null;
        if (this.pending > 0) {
          this.visibleSubject.next(true);
          this.lastShownAt = Date.now();
        }
      }, delay);
    }
  }

  requestFinished() {
    this.pending = Math.max(0, this.pending - 1);
    // marca última actividad OK (para la heurística de inactividad)
    localStorage.setItem('lastApiOkAt', String(Date.now()));

    if (this.pending === 0) {
      const elapsed = Date.now() - this.lastShownAt;
      const wait = Math.max(0, this.minVisibleMs - elapsed);

      if (this.delayTimer) {
        clearTimeout(this.delayTimer);
        this.delayTimer = null;
      }
      setTimeout(() => this.visibleSubject.next(false), wait);
    }
  }

  forceShow() { this.visibleSubject.next(true); }
  forceHide() {
    this.visibleSubject.next(false);
    this.pending = 0;
    if (this.delayTimer) { clearTimeout(this.delayTimer); this.delayTimer = null; }
  }
}
