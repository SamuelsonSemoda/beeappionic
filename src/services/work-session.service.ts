import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';
import { environment } from '../environments/environment';

export interface WorkSession {
  id: number;
  location_id: number;
  nazev: string;
  datum: string;
  started_at: string;
  ended_at: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class WorkSessionService {

  private api = environment.apiUrl;

  // Mapa aktivních prací: location_id -> WorkSession
  private _activeSessions = new BehaviorSubject<Map<number, WorkSession>>(new Map());
  activeSessions$ = this._activeSessions.asObservable();

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    this.loadFromStorage();
  }

  private async loadFromStorage() {
    const stored = await this.storage.get('active_work_sessions');
    if (stored) {
      this._activeSessions.next(new Map(Object.entries(stored).map(([k, v]) => [Number(k), v as WorkSession])));
    }
  }

  private async saveToStorage(map: Map<number, WorkSession>) {
    const obj: any = {};
    map.forEach((v, k) => obj[k] = v);
    await this.storage.set('active_work_sessions', obj);
  }

  getActiveSession(locationId: number): WorkSession | undefined {
    return this._activeSessions.getValue().get(locationId);
  }

  async startSession(locationId: number, nazev: string, datum: string): Promise<WorkSession> {
    const session: any = await firstValueFrom(
      this.http.post(`${this.api}/locations/${locationId}/work-sessions`, { nazev, datum })
    );

    const map = new Map(this._activeSessions.getValue());
    map.set(locationId, session);
    this._activeSessions.next(map);
    await this.saveToStorage(map);

    return session;
  }

  async stopSession(locationId: number): Promise<void> {
    const session = this.getActiveSession(locationId);
    if (!session) return;

    await firstValueFrom(
      this.http.patch(`${this.api}/work-sessions/${session.id}/stop`, {})
    );

    const map = new Map(this._activeSessions.getValue());
    map.delete(locationId);
    this._activeSessions.next(map);
    await this.saveToStorage(map);
  }

  isActive(locationId: number): boolean {
    return this._activeSessions.getValue().has(locationId);
  }

  getElapsedTime(locationId: number): string {
    const session = this.getActiveSession(locationId);
    if (!session) return '';

    const start = new Date(session.started_at).getTime();
    const now = Date.now();
    const diff = Math.floor((now - start) / 1000);

    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

}
