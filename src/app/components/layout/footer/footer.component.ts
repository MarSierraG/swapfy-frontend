import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  showComingSoonAlert(): void {
    Swal.fire({
      title: '¡Estamos trabajando en ello!',
      text: 'La presencia de Swapfy en redes sociales aún está en construcción. Muy pronto podrás seguirnos y estar al día. ¡Gracias por tu paciencia!',
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#009ba5',
    });
  }
}
