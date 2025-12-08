import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AdminDashboardService, RecentActivityItem } from '../../../services/admin-dashboard.service';
import { HttpClientModule } from '@angular/common/http';

interface AdminStats {
  totalUsers: number;
  lockedAccounts: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  loading = true;

  // Expose observables for async pipe
  stats$!: Observable<AdminStats>;
  recentActivity$!: Observable<RecentActivityItem[]>;

  constructor(
    private router: Router,
    private adminDashboardService: AdminDashboardService
  ) {}

  ngOnInit(): void {
    this.stats$ = this.adminDashboardService.getStats().pipe(
      catchError(() =>
        of({
          totalUsers: 0,
          lockedAccounts: 0
        } as AdminStats)
      )
    );

    this.recentActivity$ = this.adminDashboardService.getRecentActivity().pipe(
      catchError(() => of([] as RecentActivityItem[])),
      tap(() => (this.loading = false))
    );
  }

  navigateTo(segment: string): void {
    this.router.navigate(['/admin', segment]);
  }
}
