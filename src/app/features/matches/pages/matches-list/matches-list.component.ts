import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { MatchesService } from '../../services/matches.service';
import { Match } from '../../../../core/models/user.model';
import { ToastService } from '../../../../core/toast.service';

type ScoreForm = FormGroup<{
  homeScore: FormControl<number>;
  awayScore: FormControl<number>;
}>;

@Component({
  selector: 'app-matches-list',
  templateUrl: './matches-list.component.html',
  styleUrls: ['./matches-list.component.scss'],

  standalone: false,
})
export class MatchesListComponent implements OnInit {
  readonly matches$ = new BehaviorSubject<Match[]>([]);
  readonly loading$ = new BehaviorSubject<boolean>(false);
  readonly editingScore = new BehaviorSubject<number | null>(null);
  private readonly fb = inject(FormBuilder);
  private readonly scoreForms = new Map<number, ScoreForm>();

  constructor(
    private readonly matchesService: MatchesService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadMatches();
  }

  loadMatches(): void {
    this.loading$.next(true);
    this.matchesService.listUpcoming().subscribe({
      next: (matches) => {
        this.scoreForms.clear();
        this.matches$.next(matches);
        this.loading$.next(false);
      },
      error: () => {
        this.loading$.next(false);
        this.toast.error('Impossible de charger les matchs.');
      },
    });
  }

  startScore(matchId: number): void {
    this.editingScore.next(matchId);
  }

  cancelScore(): void {
    this.editingScore.next(null);
  }

  getScoreForm(match: Match): ScoreForm {
    if (!this.scoreForms.has(match.id)) {
      this.scoreForms.set(
        match.id,
        this.fb.nonNullable.group({
          homeScore: [
            match.homeScore ?? 0,
            [Validators.required, Validators.min(0)],
          ],
          awayScore: [
            match.awayScore ?? 0,
            [Validators.required, Validators.min(0)],
          ],
        }),
      );
    }

    return this.scoreForms.get(match.id)!;
  }

  submitScore(match: Match): void {
    const form = this.getScoreForm(match);
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.matchesService.reportScore(match.id, form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Score enregistré');
        this.editingScore.next(null);
        this.scoreForms.delete(match.id);
        this.loadMatches();
      },
      error: () => this.toast.error('Impossible de mettre à jour le score.'),
    });
  }
}
