import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  userName: string = '';

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('⚠ No estás logueado. Redirigiendo al login...');
      window.location.href = '/login';
      return;
    }

    // Aquí ya no necesitamos decodificar nada
    this.userName = localStorage.getItem('userName') || 'Usuario';
  }

  // Método para cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    alert('Has cerrado sesión. ¡Hasta pronto!');
    window.location.href = '/login';
  }
}
