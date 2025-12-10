import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

type UserStatus = 'ACTIVE' | 'LOCKED' | 'REVOKED';
type UserRole = 'investor' | 'broker' | 'admin';

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isLocked: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<AdminUser[]> {
    // Fetch all users from the JSON server
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
        map(users => users.map(u => ({
            id: u.id,
            name: u.name || u.username,
            username: u.username,
            email: u.email,
            role: u.role as UserRole,
            status: u.isRevoked ? 'REVOKED' : (u.isLocked ? 'LOCKED' : 'ACTIVE') as UserStatus,
            isLocked: u.isLocked,
        } as AdminUser))),
        catchError(() => of([]))
    );
  }

  revokeAccess(userId: string): Observable<void> {
    const patchBody = {
        status: 'REVOKED',
        isRevoked: true, 
    };
    
    return this.http.patch<any>(`${this.apiUrl}/users/${userId}`, patchBody).pipe(
        map(() => { /* Return void on success */ }),
        catchError(error => {
            console.error('API Error revoking access:', error);
            return throwError(() => error);
        })
    );
  }
}