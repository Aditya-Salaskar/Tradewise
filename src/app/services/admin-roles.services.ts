import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export type UserStatus = 'ACTIVE' | 'LOCKED' | 'REVOKED';
export type UserRole = 'investor' | 'broker' | 'admin';

export interface AdminUser {
  id: string;
  name: string;
  username: string; 
  email: string;
  role: UserRole;
  status: UserStatus;
  isLocked: boolean; 
  lastLogin?: Date | string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminRolesService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {} 

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
        map(users => users.map(u => ({
            id: u.id,
            name: u.name || u.username,
            username: u.username,
            email: u.email,
            role: u.role as UserRole,
            status: u.isRevoked ? 'REVOKED' : (u.isLocked ? 'LOCKED' : 'ACTIVE') as UserStatus,
            isLocked: u.isLocked,
            lastLogin: u.lastLogin,
        } as AdminUser))),
        catchError(() => of([]))
    );
  }

  assignRole(userId: string, role: UserRole): Observable<void> {
    const patchBody = {
        role: role,
    };
    
    return this.http.patch<any>(`${this.apiUrl}/users/${userId}`, patchBody).pipe(
        map(() => { /* Return void on success */ }),
        catchError(error => {
            console.error(`API Error assigning role ${role} to user ${userId}:`, error);
            return throwError(() => error); 
        })
    );
  }
}