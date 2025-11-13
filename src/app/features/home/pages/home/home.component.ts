import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/auth.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  isAuthenticated$!: Observable<boolean>;
  currentUser$!: Observable<User | null>;

  constructor(private readonly authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }
}
