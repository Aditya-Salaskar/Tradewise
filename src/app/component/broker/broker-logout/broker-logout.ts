import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-broker-logout',
  standalone: true,
  template: ''
})
export class BrokerLogout {
  constructor(private router: Router) {
    localStorage.clear();
    sessionStorage.clear();

    this.router.navigate(['/']);
  }
}
