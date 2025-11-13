import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { TeamsService } from '../../services/teams.service';
import {
  Team,
  TeamMember,
  UserSummary,
} from '../../../../core/models/user.model';
import { ToastService } from '../../../../core/toast.service';
import { AuthService } from '../../../../core/auth.service';
import { extractHttpErrorMessage } from '../../../../core/utils/http-error.utils';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss'],

  standalone: false,
})
export class TeamDetailComponent implements OnInit {
  readonly team$ = new BehaviorSubject<Team | null>(null);
  readonly loading$ = new BehaviorSubject<boolean>(true);
  selectedUser: UserSummary | null = null;
  logoError: string | null = null;
  logoUploading = false;
  visibilityUpdating = false;
  visibilityError: string | null = null;
  private readonly fb = inject(FormBuilder);
  readonly renameForm = this.fb.nonNullable.group({
    name: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(120)],
    ],
  });
  private readonly route = inject(ActivatedRoute);
  private readonly teamsService = inject(TeamsService);
  private readonly toast = inject(ToastService);
  private readonly authService = inject(AuthService);
  readonly isCaptain$ = combineLatest([
    this.team$,
    this.authService.currentUser$,
  ]).pipe(
    map(([team, user]) => {
      if (!team || !user) {
        return false;
      }
      const membership = team.members?.find(
        (member) => member.userId === user.id,
      );
      return !!membership?.isCaptain;
    }),
  );

  private teamId!: number;

  ngOnInit(): void {
    this.teamId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchTeam();
  }

  fetchTeam(): void {
    this.loading$.next(true);
    this.teamsService.getById(this.teamId).subscribe({
      next: (team) => {
        this.setTeam(team);
        this.loading$.next(false);
      },
      error: () => {
        this.loading$.next(false);
        this.toast.error('Impossible de charger cette équipe.');
      },
    });
  }

  saveName(): void {
    if (this.renameForm.invalid) {
      this.renameForm.markAllAsTouched();
      return;
    }

    const name = this.renameForm.getRawValue().name.trim();
    this.teamsService.update(this.teamId, { name }).subscribe({
      next: (team) => {
        this.setTeam(team);
        this.toast.success('Nom mis à jour');
      },
      error: (error) => {
        this.toast.error(
          extractHttpErrorMessage(error, "Impossible de renommer l'équipe."),
        );
      },
    });
  }

  onVisibilityChange(event: Event, team: Team) {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;
    if (team.isPublic === checked) {
      return;
    }
    this.visibilityUpdating = true;
    this.visibilityError = null;
    this.teamsService.update(this.teamId, { isPublic: checked }).subscribe({
      next: (updated) => {
        this.visibilityUpdating = false;
        this.setTeam(updated);
        this.toast.success(
          checked
            ? 'Ton équipe est maintenant publique.'
            : 'Ton équipe redevient privée.',
        );
      },
      error: (error) => {
        this.visibilityUpdating = false;
        this.visibilityError = extractHttpErrorMessage(
          error,
          'Impossible de mettre à jour la visibilité.',
        );
      },
    });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.logoError = null;
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.logoError = 'Format non supporté (PNG, JPG ou WebP).';
      input.value = '';
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.logoError = 'Image trop volumineuse (max 2 Mo).';
      input.value = '';
      return;
    }

    this.logoUploading = true;
    this.teamsService.uploadLogo(this.teamId, file).subscribe({
      next: (team) => {
        this.logoUploading = false;
        this.setTeam(team);
        this.toast.success('Logo mis à jour.');
        input.value = '';
      },
      error: (error) => {
        this.logoUploading = false;
        this.logoError = extractHttpErrorMessage(
          error,
          'Impossible de mettre à jour le logo.',
        );
      },
    });
  }

  onUserSelected(user: UserSummary): void {
    this.selectedUser = user;
  }

  addSelectedUser(): void {
    if (!this.selectedUser) {
      return;
    }

    this.teamsService
      .addMember(this.teamId, this.selectedUser.username)
      .subscribe({
        next: (team) => {
          this.setTeam(team);
          this.toast.success(
            `${this.selectedUser?.username} rejoint l'équipe !`,
          );
          this.selectedUser = null;
        },
        error: (error) => {
          this.toast.error(
            extractHttpErrorMessage(error, "Impossible d'ajouter ce joueur."),
          );
        },
      });
  }

  copyInviteCode(code: string): void {
    void navigator.clipboard?.writeText(code);
    this.toast.info('Code copié dans le presse-papiers.');
  }

  trackMember(_index: number, member: TeamMember) {
    return member.id;
  }

  teamInitials(name: string): string {
    return name
      .split(' ')
      .map((chunk) => chunk.trim()[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  private setTeam(team: Team): void {
    this.team$.next(team);
    this.renameForm.patchValue({ name: team.name });
  }
}
