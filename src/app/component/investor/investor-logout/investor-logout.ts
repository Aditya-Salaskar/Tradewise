import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-investor-logout',
  standalone: true,
  template: ''
})
export class InvestorLogout {
  constructor(private router: Router) {
    localStorage.clear();
    sessionStorage.clear();

    this.router.navigate(['/']);
  }
}