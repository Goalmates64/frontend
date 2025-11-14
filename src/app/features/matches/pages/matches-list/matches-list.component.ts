import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import {
  MatchesService,
  UpdateAttendancePayload,
} from '../../services/matches.service';
import {
  Match,
  MatchAttendance,
  MatchAttendanceStatus,
} from '../../../../core/models/user.model';
import { ToastService } from '../../../../core/toast.service';
import { AuthService } from '../../../../core/auth.service';

type ScoreForm = FormGroup<{
  homeScore: FormControl<number>;
  awayScore: FormControl<number>;
}>;

type AttendanceForm = FormGroup<{
  status: FormControl<MatchAttendanceStatus>;
  reason: FormControl<string>;
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
  readonly attendanceLoading$ = new BehaviorSubject<number | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly scoreForms = new Map<number, ScoreForm>();
  private readonly attendanceForms = new Map<number, AttendanceForm>();
  private currentUserId: number | null = null;

  constructor(
    private readonly matchesService: MatchesService,
    private readonly toast: ToastService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(take(1)).subscribe((user) => {
      this.currentUserId = user?.id ?? null;
    });
    this.loadMatches();
  }

  loadMatches(): void {
    this.loading$.next(true);
    this.matchesService.listUpcoming().subscribe({
      next: (matches) => {
        this.scoreForms.clear();
        this.attendanceForms.clear();
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
        this.toast.success('Score enregistr�');
        this.editingScore.next(null);
        this.scoreForms.delete(match.id);
        this.loadMatches();
      },
      error: () => this.toast.error('Impossible de mettre � jour le score.'),
    });
  }

  getAttendanceForm(match: Match): AttendanceForm {
    if (!this.attendanceForms.has(match.id)) {
      const existing = this.getUserAttendance(match);
      this.attendanceForms.set(
        match.id,
        this.fb.nonNullable.group({
          status: [existing?.status ?? 'present', Validators.required],
          reason: [existing?.reason ?? '', [Validators.maxLength(500)]],
        }),
      );
    }

    return this.attendanceForms.get(match.id)!;
  }

  selectAttendance(match: Match, status: MatchAttendanceStatus): void {
    this.getAttendanceForm(match).controls.status.setValue(status);
  }

  submitAttendance(match: Match): void {
    const form = this.getAttendanceForm(match);
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.attendanceLoading$.next(match.id);
    const payload: UpdateAttendancePayload = {
      status: form.controls.status.value,
      reason: form.controls.reason.value?.trim() || undefined,
    };

    this.matchesService.respondAttendance(match.id, payload).subscribe({
      next: () => {
        this.toast.success('Présence mise à jour');
        this.attendanceLoading$.next(null);
        this.attendanceForms.delete(match.id);
        this.loadMatches();
      },
      error: () => {
        this.attendanceLoading$.next(null);
        this.toast.error('Impossible de mettre à jour ta présence.');
      },
    });
  }

  getAttendanceSummary(match: Match): { present: number; absent: number } {
    const attendances = match.attendances ?? [];
    return {
      present: attendances.filter(
        (attendance) => attendance.status === 'present',
      ).length,
      absent: attendances.filter((attendance) => attendance.status === 'absent')
        .length,
    };
  }

  getUserAttendance(match: Match): MatchAttendance | undefined {
    if (!this.currentUserId) {
      return undefined;
    }
    const attendances = match.attendances ?? [];
    return attendances.find(
      (attendance) => attendance.userId === this.currentUserId,
    );
  }
}
