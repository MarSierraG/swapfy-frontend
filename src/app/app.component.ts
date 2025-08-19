import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackendLoaderComponent } from './components/backend-loader/backend-loader.component';
import { MadridDatePipe } from './pipes/madrid-date.pipe';
import { BackendLoaderService } from './services/backend-loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BackendLoaderComponent, MadridDatePipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  isBackendLoading = false;
  private sub?: Subscription;

  constructor(private loader: BackendLoaderService) {
    this.sub = this.loader.visible$.subscribe(v => (this.isBackendLoading = v));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
