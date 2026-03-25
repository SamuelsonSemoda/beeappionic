import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  api = 'https://app.beezy.cz/api';

  private _syncing = new BehaviorSubject<boolean>(false);
  syncing$ = this._syncing.asObservable();

  constructor(
    private http: HttpClient,
    private network: NetworkService,
    private storage: StorageService,
    private toast: ToastController
  ) {
    // Automaticky spustíme sync při obnovení připojení
    this.network.isOnline$.subscribe(async online => {
      if (online) {
        await this.sync();
      }
    });
  }

  async sync(): Promise<void> {

    if (this._syncing.getValue()) return;

    const queue = await this.network.getQueue();
    if (queue.length === 0) return;

    this._syncing.next(true);

    let successCount = 0;
    let failCount = 0;

    for (const action of queue) {
      try {
        await this.processAction(action);
        await this.network.dequeue(action.id);
        successCount++;
      } catch (e) {
        console.error('Sync selhal pro akci:', action, e);
        failCount++;
      }
    }

    // Invalidujeme cache aby se načetla čerstvá data
    await this.storage.set('locations', null);

    this._syncing.next(false);

    if (successCount > 0) {
      await this.showToast(
        `✅ Synchronizováno ${successCount} ${successCount === 1 ? 'změna' : 'změn'}`,
        'success'
      );
    }

    if (failCount > 0) {
      await this.showToast(
        `⚠️ ${failCount} změn se nepodařilo synchronizovat`,
        'warning'
      );
    }

  }

  private async processAction(action: any): Promise<void> {

    switch (action.type) {

      case 'addLocation':
        await firstValueFrom(
          this.http.post(`${this.api}/locations`, action.payload)
        );
        break;

      case 'addBeehive':
        await firstValueFrom(
          this.http.post(`${this.api}/beehives`, action.payload)
        );
        break;

      case 'addRecord':
        await firstValueFrom(
          this.http.post(
            `${this.api}/beehives/${action.payload.beehive_id}/records`,
            action.payload
          )
        );
        break;

      case 'deleteLocation':
        await firstValueFrom(
          this.http.delete(`${this.api}/locations/${action.payload.id}`)
        );
        break;

      case 'deleteBeehive':
        await firstValueFrom(
          this.http.delete(`${this.api}/beehives/${action.payload.id}`)
        );
        break;

      case 'deleteRecord':
        await firstValueFrom(
          this.http.delete(`${this.api}/records/${action.payload.id}`)
        );
        break;

    }

  }

  private async showToast(message: string, color: string): Promise<void> {
    const t = await this.toast.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await t.present();
  }

}
