import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MadridDatePipe } from './pipes/madrid-date.pipe';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MadridDatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'Swapfy';
}
