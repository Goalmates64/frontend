import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';

import {MatchesRoutingModule} from './matches-routing.module';
import {MatchesListComponent} from './pages/matches-list/matches-list.component';
import {MatchCreateComponent} from './pages/match-create/match-create.component';

@NgModule({
  declarations: [MatchesListComponent, MatchCreateComponent],
  imports: [CommonModule, ReactiveFormsModule, MatchesRoutingModule],
})
export class MatchesModule {
}

