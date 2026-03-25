import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  api = 'https://app.beezy.cz/api';

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {}

  /* LOCATIONS */
  async getLocations() {

    let cached = await this.storage.get('locations');

    if (navigator.onLine) {

      try {

        // Načítáme locations s beehives a jejich records (eager loading na backendu)
        const data: any = await firstValueFrom(
          this.http.get(`${this.api}/locations`)
        );

        await this.storage.set('locations', data);

        return data;

      } catch (e) {

        console.warn('API failed, using cache');

        return cached || [];

      }

    }

    return cached || [];

  }

  async addLocation(data: any) {

    if (navigator.onLine) {

      return await firstValueFrom(
        this.http.post(`${this.api}/locations`, data)
      );

    } else {

      let locations = await this.storage.get('locations') || [];

      data.offline = true;
      data.id = Date.now();

      locations.push(data);

      await this.storage.set('locations', locations);

      return data;

    }

  }

  async deleteLocation(id: number) {

    return await firstValueFrom(
      this.http.delete(`${this.api}/locations/${id}`)
    );

  }

  /* BEEHIVES */
  getBeehives(locationId: number) {
    return firstValueFrom(
      this.http.get(`${this.api}/locations/${locationId}/beehives`)
    );
  }

  async addBeehive(data: any) {

    return await firstValueFrom(
      this.http.post(`${this.api}/beehives`, data)
    );

  }

  async deleteBeehive(id: number) {

    return await firstValueFrom(
      this.http.delete(`${this.api}/beehives/${id}`)
    );

  }

  /* RECORDS */
  getRecords(beehiveId: number) {
    return firstValueFrom(
      this.http.get(`${this.api}/beehives/${beehiveId}/records`)
    );
  }

  async addRecord(data: any) {

    // Správná nested URL dle Laravel route: /beehives/{beehive}/records
    return await firstValueFrom(
      this.http.post(`${this.api}/beehives/${data.beehive_id}/records`, data)
    );

  }

  async deleteRecord(id: number) {

    return await firstValueFrom(
      this.http.delete(`${this.api}/records/${id}`)
    );

  }

}
