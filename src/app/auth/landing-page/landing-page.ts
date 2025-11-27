import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';  // *ngFor, *ngIf
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  constructor(private router: Router) {}

  showAuthModal = false;

  openAuthModal() {
    this.showAuthModal = true;
  }

  closeAuthModal() {
    this.showAuthModal = false;
  }

  isRegisterMode = false;

loginData = { username: '', password: '' };
registerData = { username: '', email: '', password: '', role: '' };

toggleMode() {
  this.isRegisterMode = !this.isRegisterMode;
}

onLogin() {
  console.log('Login data:', this.loginData);
}

onRegister() {
  console.log('Register data:', this.registerData);
}


}
