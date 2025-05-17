import { Component } from '@angular/core';
import {NavbarWrapperComponent} from "../../components/layout/navbar-wrapper/navbar-wrapper.component";

@Component({
  selector: 'app-dummy',
    imports: [
        NavbarWrapperComponent
    ],
  templateUrl: './dummy.component.html',
  styleUrl: './dummy.component.css'
})
export class DummyComponent {

}
