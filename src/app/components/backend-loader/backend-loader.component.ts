import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LoaderComponent} from '../shared/loader/loader.component';

@Component({
  selector: 'app-backend-loader',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './backend-loader.component.html',
  styleUrls: ['./backend-loader.component.css']
})
export class BackendLoaderComponent {
  @Input() visible: boolean = false;
}
