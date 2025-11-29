import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-investor-nav',
   standalone: true,
  imports: [],
  templateUrl: './investor-nav.html',
  styleUrl: './investor-nav.css',
})
export class InvestorNav {

  constructor(private router: Router) {}

  currentActive = '';

  onNavigate(path: string) {
    const map: Record<string, string> = {
      investor: '/investor',
      portfolio: '/portfolio',
      orders: '/orders',
      trade: '/trade',
      market: '/market',
    };
    const route = map[path] || path;
    this.currentActive = path;
    this.router.navigate([route]);
  }

  logout() {
    this.router.navigate(['/']);
  }

  goProfile() {
    this.router.navigate(['/profile']);
  }

}
