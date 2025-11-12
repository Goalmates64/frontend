import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';

import {TeamsRoutingModule} from './teams-routing.module';
import {TeamsListComponent} from './pages/teams-list/teams-list.component';
import {TeamCreateComponent} from './pages/team-create/team-create.component';

@NgModule({
  declarations: [TeamsListComponent, TeamCreateComponent],
  imports: [CommonModule, ReactiveFormsModule, TeamsRoutingModule],
})
export class TeamsModule {
}

