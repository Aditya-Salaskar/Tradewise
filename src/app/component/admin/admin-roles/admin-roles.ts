
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminRolesService } from '../../../services/admin-roles.services';
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
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-roles.html',
  styleUrls: ['./admin-roles.css']
})
export class AdminRoles implements OnInit {
  users: AdminUser[] = [];
  loading = true;

  roleCounts = { investor: 0, broker: 0, admin: 0 };

  selectedUser?: AdminUser;
  newRole: UserRole | '' = '';
  assigning = false;

  constructor(private route: ActivatedRoute, private rolesService: AdminRolesService) {}

  ngOnInit(): void {
    // Load all users
    this.rolesService.getUsers()
      .pipe(catchError(() => of<AdminUser[]>([])))
      .subscribe(data => {
        this.users = data;
        this.computeRoleCounts();
        this.loading = false;
        this.tryPreselectFromQuery();
      });
  }

  private computeRoleCounts(): void {
    const inv = this.users.filter(u => u.role === 'investor').length;
    const bro = this.users.filter(u => u.role === 'broker').length;
    const adm = this.users.filter(u => u.role === 'admin').length;
    this.roleCounts = { investor: inv, broker: bro, admin: adm };
  }

  private tryPreselectFromQuery(): void {
    const userId = this.route.snapshot.queryParamMap.get('userId');
    if (!userId) return;
    const found = this.users.find(u => u.id === userId);
    if (found) this.selectUser(found);
  }

  selectUser(u: AdminUser): void {
    this.selectedUser = { ...u };
    this.newRole = u.role; // default to current role for clarity
  }

  clearSelection(): void {
    this.selectedUser = undefined;
    this.newRole = '';
  }

  assignRole(): void {
    if (!this.selectedUser || !this.newRole) return;

    const confirmed = confirm(`Assign role "${this.newRole.toUpperCase()}" to ${this.selectedUser.name}?`);
    if (!confirmed) return;

    this.assigning = true;

    // Optimistic update in list
    const idx = this.users.findIndex(u => u.id === this.selectedUser!.id);
    const previousRole = this.users[idx]?.role;
    if (idx >= 0) this.users[idx].role = this.newRole as UserRole;
    this.computeRoleCounts();

    this.rolesService.assignRole(this.selectedUser.id, this.newRole as UserRole).subscribe({
      next: () => {
        this.assigning = false;
        this.clearSelection();
      },
      error: () => {
        // rollback on error
        if (idx >= 0) this.users[idx].role = previousRole!;
        this.computeRoleCounts();
        this.assigning = false;
        alert('Failed to assign role. Please try again.');
      }
    });
  }
}
