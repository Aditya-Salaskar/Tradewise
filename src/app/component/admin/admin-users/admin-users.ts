import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminUsersService, AdminUser } from '../../../services/admin-users.services'; 
import { catchError, map, tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './admin-users.html',
  styleUrls: ['./admin-users.css']
})
export class AdminUsers implements OnInit {
  loading = true;

  // expose observables
  users$!: Observable<AdminUser[]>;
  activeCount$!: Observable<number>;
  revokedCount$!: Observable<number>;
  lockedCount$!: Observable<number>;

  constructor(private router: Router, private usersService: AdminUsersService) {}

  ngOnInit(): void {
    this.users$ = this.usersService.getUsers().pipe(
      catchError(() => of<AdminUser[]>([])),
      tap(() => this.loading = false)
    );

    // derive counts from users$
    this.activeCount$ = this.users$.pipe(
      map(users => users.filter(u => u.status === 'ACTIVE').length)
    );
    this.revokedCount$ = this.users$.pipe(
      map(users => users.filter(u => u.status === 'REVOKED').length)
    );
    this.lockedCount$ = this.users$.pipe(
      map(users => users.filter(u => u.status === 'LOCKED').length)
    );
  }

  revokeAccess(user: AdminUser): void {
    const confirmed = confirm(`Revoke access for ${user.name}? This takes effect immediately.`);
    if (!confirmed) return;

    this.usersService.revokeAccess(user.id).subscribe({
      next: () => {
        // Ideally re‑fetch users$ here to refresh the stream
        this.users$ = this.usersService.getUsers();
      },
      error: () => {
        alert('Failed to revoke access. Please try again.');
      }
    });
  }

  assignRole(user: AdminUser): void {
    this.router.navigate(['/admin/roles'], {
      queryParams: { userId: user.id }
    });
  }
}
