import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StorageService } from './storage.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private api = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {}

  /* LOCATIONS */

  async getLocations() {

    const cached = await this.storage.get('locations');

    if (navigator.onLine) {
      try {
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

  async addBeehive(data: any) {
    return await firstValueFrom(
      this.http.post(`${this.api}/beehives`, data)
    );
  }

  async getLatestSession(locationId: number): Promise<any | null> {
    try {
      return await firstValueFrom(
        this.http.get<any>(`${this.api}/locations/${locationId}/work-sessions/latest`)
      );
    } catch {
      return null;
    }
  }

  async deleteBeehive(id: number) {
    return await firstValueFrom(
      this.http.delete(`${this.api}/beehives/${id}`)
    );
  }

  /* RECORDS */

  async addRecord(data: any) {
    return await firstValueFrom(
      this.http.post(`${this.api}/beehives/${data.beehive_id}/records`, data)
    );
  }

  async getRecords(beehiveId: number): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${this.api}/beehives/${beehiveId}/records`)
    );
  }

  async deleteRecord(id: number) {
    return await firstValueFrom(
      this.http.delete(`${this.api}/records/${id}`)
    );
  }

}
