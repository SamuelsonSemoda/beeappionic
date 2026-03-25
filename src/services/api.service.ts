import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StorageService } from './storage.service';
import { NetworkService } from './network.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  api = 'https://app.beezy.cz/api';

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private network: NetworkService
  ) {}

  // ----------------------------------------------------------------
  // LOCATIONS
  // ----------------------------------------------------------------

  async getLocations(): Promise<any[]> {

    const cached = await this.storage.get('locations');

    if (this.network.isOnline) {
      try {
        const data: any = await firstValueFrom(
          this.http.get(`${this.api}/locations`)
        );
        await this.storage.set('locations', data);
        return data;
      } catch {
        console.warn('API nedostupné, používám cache');
        return cached || [];
      }
    }

    return cached || [];

  }

  async addLocation(data: any): Promise<any> {

    if (this.network.isOnline) {

      const saved: any = await firstValueFrom(
        this.http.post(`${this.api}/locations`, data)
      );

      const locations = await this.storage.get('locations') || [];
      locations.push(saved);
      await this.storage.set('locations', locations);

      return saved;

    } else {

      const action = await this.network.enqueue({ type: 'addLocation', payload: data });

      const locations = await this.storage.get('locations') || [];
      const tempItem = { ...data, id: action.id, beehives: [], beehives_count: 0, _offline: true };
      locations.push(tempItem);
      await this.storage.set('locations', locations);

      return tempItem;

    }

  }

  async deleteLocation(id: any): Promise<void> {

    const locations = await this.storage.get('locations') || [];
    await this.storage.set('locations', locations.filter((l: any) => l.id !== id));

    if (this.network.isOnline) {
      await firstValueFrom(this.http.delete(`${this.api}/locations/${id}`));
    } else {
      if (!String(id).startsWith('offline_')) {
        await this.network.enqueue({ type: 'deleteLocation', payload: { id } });
      }
    }

  }

  // ----------------------------------------------------------------
  // BEEHIVES
  // ----------------------------------------------------------------

  async addBeehive(data: any): Promise<any> {

    if (this.network.isOnline) {

      const saved: any = await firstValueFrom(
        this.http.post(`${this.api}/beehives`, data)
      );

      const locations = await this.storage.get('locations') || [];
      const loc = locations.find((l: any) => l.id == data.location_id);
      if (loc) {
        loc.beehives = loc.beehives || [];
        loc.beehives.push(saved);
        loc.beehives_count = (loc.beehives_count || 0) + 1;
      }
      await this.storage.set('locations', locations);

      return saved;

    } else {

      const action = await this.network.enqueue({ type: 'addBeehive', payload: data });

      const locations = await this.storage.get('locations') || [];
      const loc = locations.find((l: any) => l.id == data.location_id);
      if (loc) {
        loc.beehives = loc.beehives || [];
        const tempItem = { ...data, id: action.id, records: [], _offline: true };
        loc.beehives.push(tempItem);
        loc.beehives_count = (loc.beehives_count || 0) + 1;
      }
      await this.storage.set('locations', locations);

      return { ...data, id: action.id, _offline: true };

    }

  }

  async deleteBeehive(id: any): Promise<void> {

    const locations = await this.storage.get('locations') || [];
    for (const loc of locations) {
      if (loc.beehives) {
        const before = loc.beehives.length;
        loc.beehives = loc.beehives.filter((b: any) => b.id !== id);
        loc.beehives_count -= (before - loc.beehives.length);
      }
    }
    await this.storage.set('locations', locations);

    if (this.network.isOnline) {
      await firstValueFrom(this.http.delete(`${this.api}/beehives/${id}`));
    } else {
      if (!String(id).startsWith('offline_')) {
        await this.network.enqueue({ type: 'deleteBeehive', payload: { id } });
      }
    }

  }

  // ----------------------------------------------------------------
  // RECORDS
  // ----------------------------------------------------------------

  async addRecord(data: any): Promise<any> {

    if (this.network.isOnline) {

      const saved: any = await firstValueFrom(
        this.http.post(`${this.api}/beehives/${data.beehive_id}/records`, data)
      );

      const locations = await this.storage.get('locations') || [];
      for (const loc of locations) {
        const hive = loc.beehives?.find((b: any) => b.id == data.beehive_id);
        if (hive) {
          hive.records = hive.records || [];
          hive.records.unshift(saved);
        }
      }
      await this.storage.set('locations', locations);

      return saved;

    } else {

      const action = await this.network.enqueue({ type: 'addRecord', payload: data });

      const locations = await this.storage.get('locations') || [];
      for (const loc of locations) {
        const hive = loc.beehives?.find((b: any) => b.id == data.beehive_id);
        if (hive) {
          hive.records = hive.records || [];
          hive.records.unshift({ ...data, id: action.id, _offline: true });
        }
      }
      await this.storage.set('locations', locations);

      return { ...data, id: action.id, _offline: true };

    }

  }

  async deleteRecord(id: any): Promise<void> {

    const locations = await this.storage.get('locations') || [];
    for (const loc of locations) {
      for (const hive of loc.beehives || []) {
        hive.records = (hive.records || []).filter((r: any) => r.id !== id);
      }
    }
    await this.storage.set('locations', locations);

    if (this.network.isOnline) {
      await firstValueFrom(this.http.delete(`${this.api}/records/${id}`));
    } else {
      if (!String(id).startsWith('offline_')) {
        await this.network.enqueue({ type: 'deleteRecord', payload: { id } });
      }
    }

  }

}
