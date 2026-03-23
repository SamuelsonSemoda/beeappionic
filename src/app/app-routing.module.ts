import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('./home/home.page').then(m => m.HomePage)
  },

  {
    path: 'beehives/:id',
    loadComponent: () =>
      import('./pages/beehives/beehives.page').then(m => m.BeehivesPage)
  },

  {
    path: 'records/:id',
    loadComponent: () =>
      import('./pages/records/records.page').then(m => m.RecordsPage)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
