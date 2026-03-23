import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { ApiService } from '../../services/api.service';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.page.html',
  imports: [CommonModule, FormsModule, IonicModule]
})
export class HomePage implements OnInit {

  locations: any[] = [];

  isModalOpen = false;

  newLocation: any = {
    nazev: '',
    lokace: '',
    poznamky: ''
  };

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
    this.api.syncLocations();
  }

  ionViewWillEnter() {
    this.load();
  }

  async load() {

    const data = await this.api.getLocations();

    this.locations = data || [];

  }

  open(loc: any) {
    this.router.navigate(['/beehives', loc.id]);
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  async save() {

    if (!this.newLocation.nazev) {
      alert('Zadej název');
      return;
    }

    try {

      const res: any = await this.api.addLocation(this.newLocation);

      this.locations.push(res);

      this.newLocation = {
        nazev: '',
        lokace: '',
        poznamky: ''
      };

      this.closeModal();

    } catch (err:any) {

      console.error(err);
      alert('Chyba při ukládání');

    }

  }

  async delete(id: number) {

    if (!confirm('Opravdu smazat?')) return;

    try {

      await this.api.deleteLocation(id);

      this.locations = this.locations.filter(l => l.id !== id);

    } catch (err:any) {

      console.error(err);
      alert('Chyba při mazání');

    }

  }

}
