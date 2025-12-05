
// role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: import('@angular/router').ActivatedRouteSnapshot): boolean | UrlTree {
    const expected = route.routeConfig?.path; // 'broker' or 'investor'
    const role = this.auth.getRole(); // 'broker' | 'investor'
    if (expected !== role) {
      return this.router.parseUrl(`/${role}/dashboard`);
    }
    return true;
  }
}
