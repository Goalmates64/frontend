import { Component, Input } from '@angular/core';

import { Match } from '../../../../core/models/user.model';

type TeamSide = 'home' | 'away';
type MatchWinner = TeamSide | 'draw' | null;

@Component({
  selector: 'app-match-history-card',
  templateUrl: './match-history-card.component.html',
  styleUrls: ['./match-history-card.component.scss'],
  standalone: false,
})
export class MatchHistoryCardComponent {
  @Input() match!: Match;

  get statusPill() {
    if (this.match.status === 'played') {
      return {
        label: 'Terminé',
        classes: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
      };
    }

    if (this.match.status === 'canceled') {
      return {
        label: 'Annulé',
        classes: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
      };
    }

    return {
      label: 'Expiré',
      classes: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    };
  }

  hasScore(): boolean {
    return this.getScorePair() !== null;
  }

  getWinner(): MatchWinner {
    if (this.match.status !== 'played') {
      return null;
    }

    const scores = this.getScorePair();
    if (!scores) {
      return null;
    }

    if (scores.homeScore === scores.awayScore) {
      return 'draw';
    }

    return scores.homeScore > scores.awayScore ? 'home' : 'away';
  }

  getTeamName(side: TeamSide): string {
    if (side === 'home') {
      return this.match.homeTeam?.name ?? `Équipe #${this.match.homeTeamId}`;
    }

    return this.match.awayTeam?.name ?? `Équipe #${this.match.awayTeamId}`;
  }

  getTeamInitial(side: TeamSide): string {
    const name = this.getTeamName(side).trim();
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getResultSummary(): string | null {
    if (this.match.status === 'canceled') {
      return 'Match annulé';
    }

    const scores = this.getScorePair();
    if (!scores) {
      return null;
    }

    const winner = this.getWinner();
    if (winner === 'draw') {
      return 'Match nul';
    }

    if (!winner) {
      return null;
    }

    return `Victoire de ${this.getTeamName(winner)}`;
  }

  teamTileClasses(side: TeamSide) {
    const state = this.getTeamState(side);
    return {
      'border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/20 text-gm-text':
        state === 'win',
      'border-rose-500/40 text-gm-muted': state === 'loss',
      'border-amber-500/40 bg-amber-500/10 text-gm-text': state === 'draw',
      'border-gm-border/60 text-gm-muted': state === 'neutral',
    };
  }

  getScoreAccent(): string {
    const winner = this.getWinner();
    if (winner === 'draw') {
      return 'text-amber-200';
    }

    if (winner) {
      return 'text-emerald-200';
    }

    if (this.match.status === 'canceled') {
      return 'text-rose-200';
    }

    return 'text-gm-text';
  }

  private getScorePair() {
    const { homeScore, awayScore } = this.match;
    if (homeScore === null || awayScore === null) {
      return null;
    }

    return { homeScore, awayScore };
  }

  private getTeamState(side: TeamSide): 'win' | 'loss' | 'draw' | 'neutral' {
    const winner = this.getWinner();
    if (!winner) {
      return 'neutral';
    }

    if (winner === 'draw') {
      return 'draw';
    }

    return winner === side ? 'win' : 'loss';
  }
}
