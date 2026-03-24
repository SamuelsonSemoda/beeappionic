import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';

@Component({
  standalone: true,
  selector: 'app-beehives',
  templateUrl: './beehives.page.html',
  imports: [CommonModule, FormsModule, IonicModule]
})
export class BeehivesPage implements OnInit {

  locationId!: number;
  locationName = '';

  beehives: any[] = [];

  isModalOpen = false;

  newBeehive: any = {
    nazev: '',
    cislo: '',
    poznamky: '',
    location_id: null
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit() {

    this.locationId = Number(this.route.snapshot.paramMap.get('id'));

    this.newBeehive.location_id = this.locationId;

    this.load();

  }

  ionViewWillEnter() {
    this.load();
  }

  async load() {

    const locations = await this.api.getLocations();

    const found = locations.find((l: any) => l.id == this.locationId);

    this.locationName = found?.nazev || 'Úly';

    this.beehives = found?.beehives || [];

  }

  openRecords(hive: any) {
    this.router.navigate(['/records', hive.id]);
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  async save() {

    if (!this.newBeehive.cislo) {
      alert('Zadej číslo úlu');
      return;
    }

    const res = await this.api.addBeehive(this.newBeehive);

    this.beehives.push(res);

    this.newBeehive = {
      nazev: '',
      cislo: '',
      poznamky: '',
      location_id: this.locationId
    };

    this.closeModal();

  }

  async delete(id: number) {

    if (!confirm('Smazat úl?')) return;

    await this.api.deleteBeehive(id);

    this.beehives = this.beehives.filter(h => h.id !== id);

  }

}
