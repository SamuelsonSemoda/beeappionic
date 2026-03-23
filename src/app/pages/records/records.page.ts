import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../../services/api.service';

@Component({
  standalone: true,
  selector: 'app-records',
  templateUrl: './records.page.html',
  imports: [CommonModule, IonicModule, FormsModule]
})
export class RecordsPage {

  records: any[] = [];
  beehiveId: any;
  beehiveName: string = '';

  newRecord: any = {
    typ_akce: '',
    datum: ''
  };

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ionViewWillEnter() {
    this.beehiveId = this.route.snapshot.paramMap.get('id');
    this.load();
  }

  async load() {

    const data = await this.api.getLocations();

    let found:any = null;

    data.forEach((loc:any)=>{

      loc.beehives?.forEach((h:any)=>{

        if(h.id == this.beehiveId){
          found = h;
        }

      });

    });

    this.beehiveName = found?.nazev || 'Záznamy';
    this.records = found?.records || [];

  }

  add() {

    if (!this.newRecord.typ_akce || !this.newRecord.datum) return;

    const data = {
      beehive_id: this.beehiveId,
      typ_akce: this.newRecord.typ_akce,
      datum: this.newRecord.datum
    };

    this.api.addRecord(data).subscribe((res: any) => {
      this.records.unshift(res);
      this.newRecord = { typ_akce: '', datum: '' };
    });

  }

  delete(id: number) {

    if (!confirm('Opravdu smazat?')) return;

    this.api.deleteRecord(id).subscribe(() => {
      this.records = this.records.filter(r => r.id !== id);
    });

  }

}
