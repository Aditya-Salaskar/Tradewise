
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

type MenuItem = {
  icon: string;
  label: string;
  segment: string;
  exact?: boolean;
};

type Role = 'broker' | 'investor' | 'admin';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  get role(): Role {
    const url = this.router.url; // e.g., '/broker/dashboard' or '/investor/portfolio'
    if (url.startsWith('/admin')) return 'admin';
    if (url.startsWith('/investor')) return 'investor';
    return 'broker';
  }

  get base(): string {
    return `/${this.role}`;
  }

  get menu(): MenuItem[] {
    if (this.role === 'admin') {
      return [
        { icon: '📊', label: 'Dashboard', segment: 'dashboard', exact: true },
        { icon: '👥', label: 'Users', segment: 'users' },
        { icon: '🔐', label: 'Roles', segment: 'roles' },
      ];
    }

    if (this.role === 'broker') {
      return [
        { icon: '📊', label: 'Dashboard', segment: 'dashboard', exact: true },
        { icon: '⚠️', label: 'Risk Analysis', segment: 'risk-analysis' },
        { icon: '👤', label: 'Profile', segment: 'profile' }
      ];
    } else {
      return [
        { icon: '📊', label: 'Dashboard', segment: 'dashboard', exact: true },
        { icon: '💼', label: 'Portfolio', segment: 'portfolio' },
        { icon: '💹', label: 'Trade', segment: 'trade' },
        { icon: '🧾', label: 'Orders', segment: 'orders' },
        { icon: '📈', label: 'Market', segment: 'market' },
        { icon: '👤', label: 'Profile', segment: 'profile' }
      ];
    }
  }

  get logoutLink(): string[] {
    return [this.base, 'logout'];
  }

  get logoLink(): string[] {
    return [this.base, 'dashboard'];
  }


onLogout(): void {
  try {
    this.authService.logout();
    this.router.navigateByUrl('/');
  } catch (e) {
    console.error('Logout failed:', e);
  }
}


}
