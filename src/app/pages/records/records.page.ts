import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { WorkSessionService } from '../../../services/work-session.service';

@Component({
  standalone: true,
  selector: 'app-records',
  templateUrl: './records.page.html',
  imports: [CommonModule, FormsModule, IonicModule]
})
export class RecordsPage implements OnInit {

  beehiveId!: number;
  locationId!: number;
  beehiveName = '';
  records: any[] = [];
  isModalOpen = false;

  newRecord: any = {
    typ_akce: 'kontrola',
    datum: '',
    popis: '',
    beehive_id: null
  };

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public workSession: WorkSessionService
  ) {}

  ngOnInit() {
    this.beehiveId = Number(this.route.snapshot.paramMap.get('id'));
    this.newRecord.beehive_id = this.beehiveId;
    this.load();
  }

  ionViewWillEnter() {
    this.load();
  }

  async load() {
    const locations = await this.api.getLocations();

    for (const loc of locations) {
      const hive = loc.beehives?.find((b: any) => b.id == this.beehiveId);
      if (hive) {
        this.beehiveName = `Úl ${hive.cislo}`;
        this.locationId = loc.id;
        break;
      }
    }

    // Načti záznamy přímo z API – vrátí i work_session objekt
    this.records = await this.api.getRecords(this.beehiveId);
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  async save() {
    try {
      const res: any = await this.api.addRecord(this.newRecord);

      const record = {
        id: res.id,
        typ_akce: res.typ_akce,
        datum: res.datum,
        popis: res.popis,
        work_session: res.work_session ?? null
      };

      this.records = [record, ...this.records];

      this.newRecord = {
        typ_akce: 'kontrola',
        datum: '',
        popis: '',
        beehive_id: this.beehiveId
      };

      this.closeModal();

    } catch (e: any) {
      console.error('Chyba při ukládání:', e);
    }
  }

  async delete(id: number) {
    if (!confirm('Smazat záznam?')) return;
    await this.api.deleteRecord(id);
    this.records = this.records.filter(r => r.id !== id);
  }

}
