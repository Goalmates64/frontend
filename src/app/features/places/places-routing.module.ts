import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PlacesListComponent } from './pages/places-list/places-list.component';
import { PlaceCreateComponent } from './pages/place-create/place-create.component';
import { PlaceDetailComponent } from './pages/place-detail/place-detail.component';
import { PlaceEditComponent } from './pages/place-edit/place-edit.component';

const routes: Routes = [
  { path: '', component: PlacesListComponent, data: { title: 'Mes lieux' } },
  { path: 'new', component: PlaceCreateComponent, data: { title: 'Ajouter un lieu' } },
  { path: ':id', component: PlaceDetailComponent, data: { title: 'Fiche lieu' } },
  { path: ':id/edit', component: PlaceEditComponent, data: { title: 'Modifier le lieu' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlacesRoutingModule {}
