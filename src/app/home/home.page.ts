import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { ApiService } from '../../services/api.service';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.page.html',
  imports: [CommonModule, FormsModule, IonicModule]
})
export class HomePage {

  locations: any[] = [];

  isModalOpen = false;

  newLocation: any = {
    nazev: '',
    lokace: '',
    poznamky: ''
  };

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.api.getLocations().subscribe((data: any) => {
      this.locations = data;
    });
  }

  open(loc: any) {
    this.router.navigate(['/beehives', loc.id]);
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  save() {

    if (!this.newLocation.nazev) {
      alert('Zadej název');
      return;
    }

    this.api.addLocation(this.newLocation).subscribe({
      next: (res: any) => {
        this.locations.push(res);
        this.newLocation = { nazev: '', lokace: '', poznamky: '' };
        this.closeModal();
      },
      error: (err) => {
        console.error(err);
        alert('Chyba při ukládání');
      }
    });

  }

  delete(id: number) {

    if (!confirm('Opravdu smazat?')) return;

    this.api.deleteLocation(id).subscribe(() => {
      this.locations = this.locations.filter(l => l.id !== id);
    });
  }

}
