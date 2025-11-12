import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {MatchesListComponent} from './pages/matches-list/matches-list.component';
import {MatchCreateComponent} from './pages/match-create/match-create.component';
import {MatchesHistoryComponent} from './pages/matches-history/matches-history.component';

const routes: Routes = [
  {path: '', component: MatchesListComponent},
  {path: 'create', component: MatchCreateComponent},
  {path: 'history', component: MatchesHistoryComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MatchesRoutingModule {
}
