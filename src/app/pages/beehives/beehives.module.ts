import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BeehivesPageRoutingModule } from './beehives-routing.module';

import { BeehivesPage } from './beehives.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BeehivesPageRoutingModule
  ],
  declarations: [BeehivesPage]
})
export class BeehivesPageModule {}
