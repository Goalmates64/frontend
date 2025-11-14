import { Component } from '@angular/core';
import { PageTitleService } from './core/page-title.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(private readonly pageTitle: PageTitleService) {
    this.pageTitle.init();
  }
}
