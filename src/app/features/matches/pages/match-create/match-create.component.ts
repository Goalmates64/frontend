import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {MatchesService} from '../../services/matches.service';
import {TeamsService} from '../../../teams/services/teams.service';
import {ToastService} from '../../../../core/toast.service';
import {Team} from '../../../../core/models/user.model';

@Component({
  selector: 'app-match-create',
  templateUrl: './match-create.component.html',
  styleUrls: ['./match-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MatchCreateComponent implements OnInit {
  teams: Team[] = [];
  loading = false;
  apiError: string | null = null;
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    homeTeamId: [null as number | null, Validators.required],
    awayTeamId: [null as number | null, Validators.required],
    scheduledAt: ['', Validators.required],
    location: ['', [Validators.required, Validators.maxLength(180)]],
  });

  constructor(
    private readonly matchesService: MatchesService,
    private readonly teamsService: TeamsService,
    private readonly toast: ToastService,
    private readonly router: Router,
  ) {
  }

  ngOnInit(): void {
    this.teamsService.getMine().subscribe({
      next: (teams) => (this.teams = teams),
      error: () => this.toast.error('Impossible de charger tes équipes.'),
    });
  }

  submit(): void {
    this.apiError = null;
    const {homeTeamId, awayTeamId, scheduledAt, location} = this.form.getRawValue();
    if (this.form.invalid || !homeTeamId || !awayTeamId || !scheduledAt || !location) {
      this.form.markAllAsTouched();
      return;
    }

    if (homeTeamId === awayTeamId) {
      this.apiError = 'Sélectionne deux équipes différentes.';
      return;
    }

    this.loading = true;
    const payload = {
      homeTeamId,
      awayTeamId,
      scheduledAt: new Date(scheduledAt).toISOString(),
      location: location.trim(),
    };

    this.matchesService.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Match programmé !');
        this.router.navigate(['/matches']);
      },
      error: (error) => {
        this.loading = false;
        this.apiError = error?.error?.message ?? 'Impossible de programmer ce match.';
      },
    });
  }
}


