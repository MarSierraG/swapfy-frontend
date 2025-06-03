import { Component, OnInit } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import Swal from 'sweetalert2';
import {FooterComponent} from "../../components/layout/footer/footer.component";

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
    imports: [
        RouterLink,
        FooterComponent
    ],
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    setTimeout(() => {
      if (token) {
        Swal.fire({
          icon: 'warning',
          title: 'Permiso denegado',
          text: 'No tienes permisos para acceder a esta página. Has sido redirigido al inicio.',
          confirmButtonColor: '#14b8a6',
          customClass: {
            popup: 'swapfy-alert'
          },
          didOpen: () => {
            const container = document.querySelector('.swapfy-alert');
            if (container) {
              const logo = document.createElement('img');
              logo.src = 'assets/logo/logo.png';
              logo.alt = 'Logo Swapfy';
              logo.className = 'swapfy-logo-top-right';
              container.appendChild(logo);
            }
          }
        }).then(() => this.router.navigate(['/home']));
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Inicia sesión',
          text: 'Necesitas iniciar sesión para acceder.',
          confirmButtonColor: '#14b8a6',
          didOpen: () => {
            const container = document.querySelector('.swapfy-alert');
            if (container) {
              const logo = document.createElement('img');
              logo.src = 'assets/logo/logo.png';
              logo.alt = 'Logo Swapfy';
              logo.className = 'swapfy-logo-top-right';
              container.appendChild(logo);
            }
          }
        }).then(() => this.router.navigate(['/login']));
      }
    }, 3000);
  }
}
