
// services/admin-roles.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

type UserStatus = 'ACTIVE' | 'LOCKED' | 'REVOKED';
type UserRole = 'investor' | 'broker' | 'admin';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Date | string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminRolesService {
  getUsers(): Observable<AdminUser[]> {
    const mock: AdminUser[] = [
      { id: 'U1001', name: 'Alice Kumar',  email: 'alice@tradewise.com', role: 'investor', status: 'ACTIVE',  lastLogin: new Date() },
      { id: 'U1002', name: 'Ravi Shah',    email: 'ravi@tradewise.com',  role: 'broker',   status: 'LOCKED',  lastLogin: new Date(Date.now() - 86400000) },
      { id: 'U1003', name: 'Meera Gupta',  email: 'meera@tradewise.com', role: 'investor', status: 'ACTIVE',  lastLogin: null },
      { id: 'U1004', name: 'John Smith',   email: 'john@tradewise.com',  role: 'admin',    status: 'ACTIVE',  lastLogin: new Date(Date.now() - 3600000) }
    ];
    return of(mock).pipe(delay(300));
  }

  assignRole(userId: string, role: UserRole): Observable<void> {
    // Simulate server-side update; replace with HTTP call
    return of(void 0).pipe(delay(250));
  }
}
