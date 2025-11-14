import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PageTitleService {
  private readonly appName = 'GoalMates';
  private initialized = false;

  constructor(
    private readonly router: Router,
    private readonly title: Title,
  ) {}

  init(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        const routeTitle = this.extractRouteTitle(this.router.routerState.snapshot.root);
        this.title.setTitle(routeTitle ? `${routeTitle} • ${this.appName}` : this.appName);
      });
  }

  private extractRouteTitle(route: ActivatedRouteSnapshot | null): string | null {
    let snapshot: ActivatedRouteSnapshot | null = route;
    let resolvedTitle: string | null = null;

    while (snapshot) {
      if (snapshot.data && snapshot.data['title']) {
        resolvedTitle = snapshot.data['title'];
      }
      snapshot = snapshot.firstChild ?? null;
    }

    return resolvedTitle;
  }
}
