import { Component, HostListener, OnInit } from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import { filter } from 'rxjs/operators';
import {SidebarDesktopComponent} from '../sidebar-desktop/sidebar-desktop.component';
import {HeaderComponent} from '../header/header.component';
import {SidebarMovilComponent} from '../sidebar-movil/sidebar-movil.component';

@Component({
  selector: 'app-navbar-wrapper',
  templateUrl: './navbar-wrapper.component.html',
  imports: [
    SidebarDesktopComponent,
    HeaderComponent,
    SidebarMovilComponent
  ],
  styleUrls: ['./navbar-wrapper.component.css']
})
export class NavbarWrapperComponent implements OnInit {
  showHeader = false;
  hideHeader = false;
  isSearchVisible = false;
  topbarHidden = false;

  private lastScrollTop = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Detectar navegación y cambiar visibilidad de la barra
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const path = this.getCleanPath(event.urlAfterRedirects);
        this.isSearchVisible = path === 'home' || path === 'store';

      });

    // Comprobar ruta actual al cargar
    const path = this.getCleanPath(this.router.url);
    this.isSearchVisible = path === 'home' || path === 'store';

    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  private getCleanPath(url: string): string {
    //  Elimina query params y fragmentos (#), y el slash inicial
    return url.split('?')[0].split('#')[0].replace(/^\//, '');
  }


  @HostListener('window:scroll', [])
  handleScroll(): void {
    const currentScroll = window.scrollY;

    if (currentScroll === 0) {
      this.showHeader = false;
      this.hideHeader = false;
    } else if (currentScroll > this.lastScrollTop && currentScroll > 80) {
      this.showHeader = false;
      this.hideHeader = true;
    } else if (currentScroll < this.lastScrollTop) {
      this.showHeader = true;
      this.hideHeader = false;
    }

    this.lastScrollTop = Math.max(currentScroll, 0);
  }
}
