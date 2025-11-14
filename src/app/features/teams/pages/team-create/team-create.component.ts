import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TeamsService } from '../../services/teams.service';
import { ToastService } from '../../../../core/toast.service';
import { extractHttpErrorMessage } from '../../../../core/utils/http-error.utils';

@Component({
  selector: 'app-team-create',
  templateUrl: './team-create.component.html',
  styleUrls: ['./team-create.component.scss'],

  standalone: false,
})
export class TeamCreateComponent {
  loading = false;
  apiError: string | null = null;
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    isPublic: [false],
  });

  constructor(
    private readonly teamsService: TeamsService,
    private readonly toast: ToastService,
    private readonly router: Router,
  ) {}

  submit(): void {
    this.apiError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { name, isPublic } = this.form.getRawValue();
    this.teamsService.create({ name: name.trim(), isPublic }).subscribe({
      next: (team) => {
        this.loading = false;
        this.toast.success(`Équipe ${team.name} créée !`);
        void this.router.navigate(['/teams']);
      },
      error: (error) => {
        this.loading = false;
        this.apiError = extractHttpErrorMessage(error, 'Impossible de créer cette équipe.');
      },
    });
  }
}
