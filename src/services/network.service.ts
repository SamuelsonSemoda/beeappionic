import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from './storage.service';

export interface OfflineAction {
  id: string;
  type: 'addLocation' | 'addBeehive' | 'addRecord' | 'deleteLocation' | 'deleteBeehive' | 'deleteRecord';
  payload: any;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private _isOnline = new BehaviorSubject<boolean>(navigator.onLine);
  isOnline$: Observable<boolean> = this._isOnline.asObservable();

constructor(private storage: StorageService) {
// Posloucháme události prohlížeče / Capacitor
merge(
fromEvent(window, 'online').pipe(map(() => true)),
fromEvent(window, 'offline').pipe(map(() => false))
).subscribe(status => {
  this._isOnline.next(status);
});
}

  get isOnline(): boolean {
  return this._isOnline.getValue();
}

// --- Offline fronta ---

async getQueue(): Promise<OfflineAction[]> {
  return (await this.storage.get('offline_queue')) || [];
}

  async enqueue(action: Omit<OfflineAction, 'id' | 'createdAt'>): Promise<OfflineAction> {
  const queue = await this.getQueue();
  const item: OfflineAction = {
  ...action,
  id: `offline_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  createdAt: Date.now()
};
  queue.push(item);
  await this.storage.set('offline_queue', queue);
  return item;
}

  async dequeue(id: string): Promise<void> {
  const queue = await this.getQueue();
  await this.storage.set('offline_queue', queue.filter(a => a.id !== id));
}

  async clearQueue(): Promise<void> {
  await this.storage.set('offline_queue', []);
}

  async getPendingCount(): Promise<number> {
  const queue = await this.getQueue();
  return queue.length;
}

}
