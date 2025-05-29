import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    const isLoggedIn = !!localStorage.getItem('token');

    setTimeout(() => {
      Swal.fire({
        icon: 'error',
        title: '¡Ups!',
        text: 'Esta URL no existe.',
        confirmButtonColor: '#14b8a6',
        confirmButtonText: 'Volver',
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
      }).then(() => {
        this.router.navigate([isLoggedIn ? '/home' : '/auth']);
      });
    }, 200); // pequeño delay por estética
  }
}
