
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminDashboardService } from '../../../services/admin-dashboard.service';

interface AdminStats {
  totalUsers: number;
  lockedAccounts: number;
  failedLoginAttempts24h: number;
  scheduledReports: number;
  pendingComplianceReports: number;
}

interface SystemHealth {
  marketDataLastUpdated: string | Date | null;
  priceUpdateInterval: number; // minutes
  apiFailures24h: number;
  lastApiFailureAt: string | Date | null;
  status: 'OK' | 'DEGRADED' | 'UNKNOWN';
}

interface ValidationStatus {
  profileValidationEnabled: boolean;
  orderValidationEnabled: boolean;
}

interface RecentActivityItem {
  at: string | Date;
  type:
    | 'ROLE_ASSIGNED'
    | 'ACCESS_REVOKED'
    | 'LOGIN_LOCKED'
    | 'REPORT_GENERATED'
    | 'REPORT_EXPORTED'
    | 'REPORT_SCHEDULED';
  description: string;
  by: string; // admin user name or system
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  loading = true;

  stats?: AdminStats;
  systemHealth?: SystemHealth;
  validation?: ValidationStatus;
  recentActivity: RecentActivityItem[] = [];

  constructor(private router: Router, private adminDashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    // Load all dashboard data (minimal + aligned to user stories)
    this.adminDashboardService.getStats()
      .pipe(catchError(() => of({
        totalUsers: 0,
        lockedAccounts: 0,
        failedLoginAttempts24h: 0,
        scheduledReports: 0,
        pendingComplianceReports: 0
      } as AdminStats)))
      .subscribe(data => this.stats = data);

    this.adminDashboardService.getSystemHealth()
      .pipe(catchError(() => of({
        marketDataLastUpdated: null,
        priceUpdateInterval: 5,
        apiFailures24h: 0,
        lastApiFailureAt: null,
        status: 'UNKNOWN'
      } as SystemHealth)))
      .subscribe(data => this.systemHealth = data);

    this.adminDashboardService.getValidationStatus()
      .pipe(catchError(() => of({
        profileValidationEnabled: true,
        orderValidationEnabled: true
      } as ValidationStatus)))
      .subscribe(data => this.validation = data);

    this.adminDashboardService.getRecentActivity()
      .pipe(catchError(() => of([] as RecentActivityItem[])))
      .subscribe(data => {
        this.recentActivity = data;
        this.loading = false;
      });
  }

   navigateTo(segment: string): void {
    this.router.navigate(['/admin', segment]);
  }
}
