import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {TeamsListComponent} from './pages/teams-list/teams-list.component';
import {TeamCreateComponent} from './pages/team-create/team-create.component';

const routes: Routes = [
  {path: '', component: TeamsListComponent},
  {path: 'create', component: TeamCreateComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamsRoutingModule {
}

