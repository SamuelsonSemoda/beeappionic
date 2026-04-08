import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.page.html',
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LoginPage {

  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async login() {

    if (!this.email || !this.password) {
      this.error = 'Vyplň email a heslo';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/'], { replaceUrl: true });
    } catch (e: any) {
      this.error = e?.error?.message || 'Nesprávné přihlašovací údaje';
    } finally {
      this.loading = false;
    }

  }

}
