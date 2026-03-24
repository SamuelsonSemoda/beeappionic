import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class HomePage implements OnInit {

  locations:any[] = [];

  isModalOpen = false;

  newLocation = {
    nazev:'',
    lokace:'',
    poznamky:''
  };

  constructor(
    private api:ApiService,
    private router:Router
  ){}

  ngOnInit(){
    this.load();
  }

  ionViewWillEnter(){
    this.load();
  }

  async load(){
    this.locations = await this.api.getLocations();
  }

  open(loc:any){
    this.router.navigate(['/beehives', loc.id]);
  }

  openModal(){
    this.isModalOpen = true;
  }

  closeModal(){
    this.isModalOpen = false;
  }

  get totalHives(){

    return this.locations.reduce((sum,loc)=>{
      return sum + (loc.beehives_count ?? loc.beehives?.length ?? 0);
    },0);

  }

  async save(){

    if(!this.newLocation.nazev){
      alert("Zadej název");
      return;
    }

    const saved = await this.api.addLocation(this.newLocation);

    this.locations.push(saved);

    this.newLocation = {
      nazev:'',
      lokace:'',
      poznamky:''
    };

    this.closeModal();

  }

  async delete(id:number){

    if(!confirm("Smazat stanoviště?")) return;

    await this.api.deleteLocation(id);

    this.locations = this.locations.filter(l => l.id !== id);

  }

  hiveWord(count:number){

    if(count === 1) return "úl";
    if(count >= 2 && count <= 4) return "úly";
    return "úlů";

  }

}
