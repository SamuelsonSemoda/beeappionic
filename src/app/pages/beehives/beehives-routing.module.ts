import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BeehivesPage } from './beehives.page';

const routes: Routes = [
  {
    path: '',
    component: BeehivesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BeehivesPageRoutingModule {}
