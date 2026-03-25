import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NetworkService } from '../services/network.service';
import { SyncService } from '../services/sync.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {

  syncing = false;

  constructor(
    public network: NetworkService,
    private sync: SyncService
  ) {}

  ngOnInit() {
    this.sync.syncing$.subscribe(s => {
      this.syncing = s;
    });
  }

}
