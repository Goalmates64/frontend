import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';

import {TeamsService} from '../../services/teams.service';
import {Team} from '../../../../core/models/user.model';
import {ToastService} from '../../../../core/toast.service';

@Component({
  selector: 'app-teams-list',
  templateUrl: './teams-list.component.html',
  styleUrls: ['./teams-list.component.scss'],

  standalone: false,
})
export class TeamsListComponent implements OnInit {
  readonly teams$ = new BehaviorSubject<Team[]>([]);
  readonly loading$ = new BehaviorSubject<boolean>(false);
  joinError: string | null = null;
  private readonly fb = inject(FormBuilder);
  readonly joinForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]],
  });

  constructor(
    private readonly teamsService: TeamsService,
    private readonly toast: ToastService,
    private readonly router: Router,
  ) {
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading$.next(true);
    this.teamsService.getMine().subscribe({
      next: (teams) => {
        this.teams$.next(teams);
        this.loading$.next(false);
      },
      error: () => {
        this.loading$.next(false);
        this.toast.error('Impossible de charger tes équipes.');
      },
    });
  }

  onJoinSubmit(): void {
    this.joinError = null;
    if (this.joinForm.invalid) {
      this.joinForm.markAllAsTouched();
      return;
    }

    const code = this.joinForm.getRawValue().code.trim().toUpperCase();
    this.teamsService.join(code).subscribe({
      next: () => {
        this.toast.success('Bienvenue dans cette équipe !');
        this.joinForm.reset();
        this.refresh();
      },
      error: (error) => {
        this.joinError = error?.error?.message ?? 'Code invalide.';
      },
    });
  }

  goToCreate(): void {
    this.router.navigate(['/teams/create']);
  }
}
