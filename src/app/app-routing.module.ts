import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage)
  },

  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./home/home.page').then(m => m.HomePage)
  },

  {
    path: 'beehives/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/beehives/beehives.page').then(m => m.BeehivesPage)
  },

  {
    path: 'records/:id',
    canActivate: [AuthGuard],
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
