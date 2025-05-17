import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() showHeader: boolean = false;
  @Input() hideHeader: boolean = false;
  @Input() isSearchVisible: boolean = false;

  @Output() searchTerm = new EventEmitter<{ term: string; field: string }>();

  searchQuery: string = '';
  selectedField: string = 'title';


  onSearchChange(): void {
    this.searchTerm.emit({
      term: this.searchQuery,
      field: this.selectedField
    });
  }
  constructor(public router: Router) {}
}
