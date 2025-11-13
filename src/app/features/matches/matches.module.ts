import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatchesRoutingModule } from './matches-routing.module';
import { MatchesListComponent } from './pages/matches-list/matches-list.component';
import { MatchCreateComponent } from './pages/match-create/match-create.component';
import { MatchesHistoryComponent } from './pages/matches-history/matches-history.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    MatchesListComponent,
    MatchCreateComponent,
    MatchesHistoryComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    MatchesRoutingModule,
  ],
})
export class MatchesModule {}
