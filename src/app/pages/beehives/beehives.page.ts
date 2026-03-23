import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../../services/api.service';

@Component({
  standalone: true,
  selector: 'app-beehives',
  templateUrl: './beehives.page.html',
  imports: [CommonModule, IonicModule, FormsModule]
})
export class BeehivesPage {

  beehives: any[] = [];
  locationId: any;
  locationName: string = '';

  newBeehive: any = {
    nazev: '',
    cislo: '',
    pocet_nastavku: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) {}

  ionViewWillEnter() {
    this.locationId = this.route.snapshot.paramMap.get('id');
    this.load();
  }

  async load() {

    const data = await this.api.getLocations();

    const loc = data.find((l:any)=> l.id == this.locationId);

    this.locationName = loc?.nazev || '';

    this.beehives = loc?.beehives || [];

  }

  add() {

    if (!this.newBeehive.nazev || !this.newBeehive.cislo) return;

    const data = {
      location_id: this.locationId,
      nazev: this.newBeehive.nazev,
      cislo: this.newBeehive.cislo,
      pocet_nastavku: this.newBeehive.pocet_nastavku
    };

    this.api.addBeehive(data).subscribe((res: any) => {
      this.beehives.push(res);
      this.newBeehive = { nazev: '', cislo: '', pocet_nastavku: '' };
    });

  }

  delete(id: number) {

    if (!confirm('Opravdu smazat úl?')) return;

    this.api.deleteBeehive(id).subscribe(() => {
      this.beehives = this.beehives.filter(h => h.id !== id);
    });

  }

  open(hive: any) {
    this.router.navigate(['/records', hive.id]);
  }

}
