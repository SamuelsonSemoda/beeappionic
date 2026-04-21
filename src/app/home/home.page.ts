import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { WorkSessionService } from '../../services/work-session.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  imports: [CommonModule, FormsModule, IonicModule]
})
export class HomePage implements OnInit, OnDestroy {

  locations: any[] = [];

  isModalOpen = false;
  isWorkModalOpen = false;

  newLocation = { nazev: '', lokace: '', poznamky: '' };

  newWork = { nazev: '', datum: new Date().toISOString().split('T')[0] };
  selectedLocationId: number | null = null;

  // Časomíra
  timer: any = null;
  tick = 0;

  private sub?: Subscription;

  constructor(
    private api: ApiService,
    private router: Router,
    private auth: AuthService,
    public workSession: WorkSessionService
  ) {}

  ngOnInit() {
    this.load();
    // Aktualizujeme časomíru každou sekundu
    this.timer = setInterval(() => this.tick++, 1000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.sub?.unsubscribe();
  }

  ionViewWillEnter() {
    this.load();
  }

  async load() {
    this.locations = await this.api.getLocations();
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

  // Work session modal
  openWorkModal(loc: any, event: Event) {
    event.stopPropagation();
    this.selectedLocationId = loc.id;
    this.newWork = { nazev: '', datum: new Date().toISOString().split('T')[0] };
    this.isWorkModalOpen = true;
  }

  closeWorkModal() {
    this.isWorkModalOpen = false;
    this.selectedLocationId = null;
  }

  async startWork() {
    if (!this.newWork.nazev || !this.selectedLocationId) return;

    await this.workSession.startSession(
      this.selectedLocationId,
      this.newWork.nazev,
      this.newWork.datum
    );

    this.closeWorkModal();
  }

  async stopWork(locationId: number, event: Event) {
    event.stopPropagation();
    if (!confirm('Ukončit práci na stanovišti?')) return;
    await this.workSession.stopSession(locationId);
  }

  getElapsed(locationId: number): string {
    this.tick; // trigger change detection
    return this.workSession.getElapsedTime(locationId);
  }

  get totalHives() {
    return this.locations.reduce((sum, loc) => {
      return sum + (loc.beehives_count ?? loc.beehives?.length ?? 0);
    }, 0);
  }

  async save() {
    if (!this.newLocation.nazev) {
      alert("Zadej název");
      return;
    }

    const saved = await this.api.addLocation(this.newLocation);
    this.locations.push(saved);
    this.newLocation = { nazev: '', lokace: '', poznamky: '' };
    this.closeModal();
  }

  async delete(id: number) {
    if (!confirm("Smazat stanoviště?")) return;
    await this.api.deleteLocation(id);
    this.locations = this.locations.filter(l => l.id !== id);
  }

  hiveWord(count: number) {
    if (count === 1) return "úl";
    if (count >= 2 && count <= 4) return "úly";
    return "úlů";
  }

  async logout() {
    await this.auth.logout();
  }

}
