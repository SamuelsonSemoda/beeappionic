import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import {environment} from "../environments/environment";

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

    let cached = await this.storage.get('locations');

    if (navigator.onLine) {

      try {

        const data: any = await this.http
          .get(`${this.api}/locations`)
          .toPromise();

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

      return await this.http.post(`${this.api}/locations`, data).toPromise();

    } else {

      let locations = await this.storage.get('locations') || [];

      data.offline = true;
      data.id = Date.now();

      locations.push(data);

      await this.storage.set('locations', locations);

      return data;

    }

  }

  async syncLocations() {

    if (!navigator.onLine) return;

    let locations = await this.storage.get('locations') || [];

    for (let loc of locations) {

      if (loc.offline) {

        await this.http.post(`${this.api}/locations`, loc).toPromise();

        loc.offline = false;

      }

    }

    await this.storage.set('locations', locations);

  }

  deleteLocation(id:number){
    return this.http.delete(`${this.api}/locations/${id}`);
  }

  /* BEEHIVES */
  getBeehives(locationId:number){
    return this.http.get(`${this.api}/locations/${locationId}/beehives`);
  }

  async addBeehive(data:any){

    const res = await fetch(this.api + '/beehives', {
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify(data)
    });

    return res.json();

  }


  async deleteBeehive(id:number){

    await fetch(this.api + '/beehives/' + id,{
      method:'DELETE'
    });

  }

  /* RECORDS */
  getRecords(beehiveId:number){
    return this.http.get(`${this.api}/beehives/${beehiveId}/records`);
  }

  addRecord(data:any){
    return this.http.post(`${this.api}/records`, data);
  }

  deleteRecord(id:number){
    return this.http.delete(`${this.api}/records/${id}`);
  }

}
