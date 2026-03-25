import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';

// npm install qrcode @types/qrcode
import * as QRCode from 'qrcode';

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

  // QR
  isQrModalOpen = false;
  qrHive: any = null;
  qrDataUrl = '';

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
    const res: any = await this.api.addBeehive(this.newBeehive);
    const hive = {
      id: res.id,
      cislo: res.cislo || this.newBeehive.cislo,
      nazev: res.nazev || this.newBeehive.nazev,
      poznamky: res.poznamky || this.newBeehive.poznamky
    };
    this.beehives = [hive, ...this.beehives];
    this.newBeehive = { cislo: '', nazev: '', poznamky: '', location_id: this.locationId };
    this.closeModal();
  }

  async delete(id: number) {
    if (!confirm('Smazat úl?')) return;
    await this.api.deleteBeehive(id);
    this.beehives = this.beehives.filter(h => h.id !== id);
  }

  // --- QR ---

  async openQr(hive: any, event: Event) {
    event.stopPropagation();
    this.qrHive = hive;
    this.qrDataUrl = '';
    this.isQrModalOpen = true;

    this.qrDataUrl = await QRCode.toDataURL(
      `https://app.beezy.cz/records/${hive.id}`,
      { width: 400, margin: 2, color: { dark: '#1a1a1a', light: '#ffffff' } }
    );
  }

  closeQrModal() {
    this.isQrModalOpen = false;
    this.qrHive = null;
    this.qrDataUrl = '';
  }

  downloadQr() {
    if (!this.qrDataUrl || !this.qrHive) return;
    const a = document.createElement('a');
    a.href = this.qrDataUrl;
    a.download = `ul-${this.qrHive.cislo}-qr.png`;
    a.click();
  }

}
