
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminUsersService } from '../../../services/admin-users.services';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-users.html',
  styleUrls: ['./admin-users.css']
})
export class AdminUsers implements OnInit {
  users: AdminUser[] = [];
  loading = true;

  // derived counts for mini-stats
  activeCount = 0;
  revokedCount = 0;
  lockedCount = 0;

  constructor(private router: Router, private usersService: AdminUsersService) {}

  ngOnInit(): void {
    this.usersService.getUsers()
      .pipe(catchError(() => {
        // fallback to empty list
        return of<AdminUser[]>([]);
      }))
      .subscribe(data => {
        this.users = data;
        this.recomputeCounts();
        this.loading = false;
      });
  }

  revokeAccess(user: AdminUser): void {
    const confirmed = confirm(`Revoke access for ${user.name}? This takes effect immediately.`);
    if (!confirmed) return;

    // optimistic update
    const originalStatus = user.status;
    user.status = 'REVOKED';
    this.recomputeCounts();

    this.usersService.revokeAccess(user.id).subscribe({
      next: () => {
        // success: already updated
      },
      error: () => {
        // rollback on error
        user.status = originalStatus;
        this.recomputeCounts();
        alert('Failed to revoke access. Please try again.');
      }
    });
  }

  assignRole(user: AdminUser): void {
    // Navigate to the roles page from the user stories (no new page added)
    this.router.navigate(['/admin/roles'], {
      queryParams: { userId: user.id }
    });
  }

  private recomputeCounts(): void {
    this.activeCount = this.users.filter(u => u.status === 'ACTIVE').length;
    this.revokedCount = this.users.filter(u => u.status === 'REVOKED').length;
    this.lockedCount = this.users.filter(u => u.status === 'LOCKED').length;
  }
}
