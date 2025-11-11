import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AuthService} from '../../../core/auth.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  isAuthenticated$: Observable<boolean>;
  currentUser$;

  mobileMenuOpen = false;

  constructor(private readonly authService: AuthService, private readonly router: Router) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  async onLogoutClick(): Promise<void> {
    this.authService.logout();
    this.closeMobileMenu();
    await this.router.navigate(['/']);
  }
}
