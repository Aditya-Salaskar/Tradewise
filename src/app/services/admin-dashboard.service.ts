import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  getStats(): Observable<any> {
    return of({
      totalUsers: 124,
      lockedAccounts: 3,
      failedLoginAttempts24h: 18,
      scheduledReports: 5,
      pendingComplianceReports: 2
    });
  }

  getSystemHealth(): Observable<any> {
    return of({
      marketDataLastUpdated: new Date(),
      priceUpdateInterval: 5,
      apiFailures24h: 1,
      lastApiFailureAt: new Date(Date.now() - 1000 * 60 * 42),
      status: 'OK'
    });
  }

  getValidationStatus(): Observable<any> {
    return of({
      profileValidationEnabled: true,
      orderValidationEnabled: true
    });
  }

  getRecentActivity(): Observable<any[]> {
    return of([
      { at: new Date(), type: 'ROLE_ASSIGNED', description: 'Assigned BROKER role to user #102', by: 'admin01' },
      { at: new Date(Date.now() - 1000 * 60 * 30), type: 'ACCESS_REVOKED', description: 'Revoked access for user #87', by: 'admin02' },
      { at: new Date(Date.now() - 1000 * 60 * 90), type: 'REPORT_GENERATED', description: 'Compliance report for Q4 generated', by: 'admin01' },
      { at: new Date(Date.now() - 1000 * 60 * 120), type: 'REPORT_EXPORTED', description: 'Risk report exported as PDF', by: 'admin03' },
      { at: new Date(Date.now() - 1000 * 60 * 180), type: 'REPORT_SCHEDULED', description: 'Weekly compliance report scheduled', by: 'admin01' }
    ]);
  }
}
``
