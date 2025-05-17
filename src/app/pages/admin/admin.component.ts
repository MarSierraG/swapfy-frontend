import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import {NavbarWrapperComponent} from "../../components/layout/navbar-wrapper/navbar-wrapper.component";

@Component({
  selector: 'app-admin',
  standalone: true,
    imports: [CommonModule, RouterModule, NavbarWrapperComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {}
