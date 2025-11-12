import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {PlacesRoutingModule} from './places-routing.module';
import {PlacesListComponent} from './pages/places-list/places-list.component';
import {PlaceCreateComponent} from './pages/place-create/place-create.component';
import {PlaceDetailComponent} from './pages/place-detail/place-detail.component';
import {PlaceEditComponent} from './pages/place-edit/place-edit.component';
import {PlaceFormComponent} from './components/place-form/place-form.component';
import {PlaceMapComponent} from './components/place-map/place-map.component';

@NgModule({
  declarations: [
    PlacesListComponent,
    PlaceCreateComponent,
    PlaceDetailComponent,
    PlaceEditComponent,
    PlaceFormComponent,
    PlaceMapComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PlacesRoutingModule],
})
export class PlacesModule {
}
