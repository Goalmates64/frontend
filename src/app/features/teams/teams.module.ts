import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TeamsRoutingModule } from './teams-routing.module';
import { TeamsListComponent } from './pages/teams-list/teams-list.component';
import { TeamCreateComponent } from './pages/team-create/team-create.component';
import { TeamDetailComponent } from './pages/team-detail/team-detail.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [TeamsListComponent, TeamCreateComponent, TeamDetailComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    TeamsRoutingModule,
  ],
})
export class TeamsModule {}
