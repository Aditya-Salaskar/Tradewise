import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminRolesService, AdminUser, UserRole } from '../../../services/admin-roles.services'; 
import { catchError, map, tap } from 'rxjs/operators';
import { of, Observable, BehaviorSubject, switchMap } from 'rxjs'; 
import { HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule], 
  templateUrl: './admin-roles.html',
  styleUrls: ['./admin-roles.css']
})
export class AdminRoles implements OnInit {
  loading = true;
  private usersSubject = new BehaviorSubject<AdminUser[]>([]);

  users$: Observable<AdminUser[]> = this.usersSubject.asObservable();
  roleCounts$!: Observable<{ investor: number; broker: number; admin: number }>;

  selectedUser?: AdminUser;
  newRole: UserRole | '' = '';
  assigning = false;

  constructor(private route: ActivatedRoute, private rolesService: AdminRolesService) {}

  ngOnInit(): void {
    this.rolesService.getUsers().pipe(
        catchError(() => of<AdminUser[]>([])),
        tap(users => {
            this.usersSubject.next(users);
            this.loading = false;
        })
    ).subscribe();

    this.roleCounts$ = this.usersSubject.pipe(
      map(users => ({
        investor: users.filter(u => u.role === 'investor').length,
        broker: users.filter(u => u.role === 'broker').length,
        admin: users.filter(u => u.role === 'admin').length
      }))
    );

    this.usersSubject.subscribe(users => {
      const userId = this.route.snapshot.queryParamMap.get('userId');
      if (!userId || users.length === 0) return;
      const found = users.find(u => u.id === userId);
      if (found) this.selectUser(found);
    });
  }

  selectUser(u: AdminUser): void {
    this.selectedUser = { ...u };
    this.newRole = u.role; 
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

    const currentUsers = this.usersSubject.getValue(); 
    const idx = currentUsers.findIndex(u => u.id === this.selectedUser!.id);
    const previousRole = currentUsers[idx]?.role;
    
    const updatedUsers = [...currentUsers];
    if (idx >= 0) {
        updatedUsers[idx] = { ...updatedUsers[idx], role: this.newRole as UserRole };
        this.usersSubject.next(updatedUsers); 
    }
    
    this.rolesService.assignRole(this.selectedUser.id, this.newRole as UserRole).pipe(
        switchMap(() => this.rolesService.getUsers())
    ).subscribe({
      next: (refreshedUsers) => {
        this.assigning = false;
        this.clearSelection();
        
        this.usersSubject.next(refreshedUsers); 
      },
      error: () => {
        if (idx >= 0) {
            const rolledBackUsers = [...currentUsers];
            rolledBackUsers[idx] = { ...rolledBackUsers[idx], role: previousRole! };
            this.usersSubject.next(rolledBackUsers); 
        }
        this.assigning = false;
        alert('Failed to assign role. Please try again.');
      }
    });
  }
}