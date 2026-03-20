import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  api = 'https://app.beezy.cz/api';

  constructor(private http: HttpClient) {}

  /* LOCATIONS */
  getLocations(){
    return this.http.get(`${this.api}/locations`);
  }

  addLocation(data:any){
    return this.http.post(`${this.api}/locations`, data);
  }

  deleteLocation(id:number){
    return this.http.delete(`${this.api}/locations/${id}`);
  }

  /* BEEHIVES */
  getBeehives(locationId:number){
    return this.http.get(`${this.api}/locations/${locationId}/beehives`);
  }

  addBeehive(data:any){
    return this.http.post(`${this.api}/beehives`, data);
  }

  deleteBeehive(id:number){
    return this.http.delete(`${this.api}/beehives/${id}`);
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
