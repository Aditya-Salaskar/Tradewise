import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface RiskMetric {
  id?: string | number;
  userId: string;
  volatility: number;
  confidenceLevel: number;
  currentExposure: number;
  exposureLimit: number;
}

export interface ComplianceReport {
  id: number;
  date: string;
  status: string;
  issuesFound: number;
  generatedBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class RiskService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getAllRiskMetrics(): Observable<RiskMetric[]> {
    return this.http.get<RiskMetric[]>(`${this.baseUrl}/riskMetrics`).pipe(
      catchError(() => of([]))
    );
  }

  getComplianceReports(): Observable<ComplianceReport[]> {
    return this.http.get<ComplianceReport[]>(`${this.baseUrl}/complianceReports`).pipe(
      catchError(() => of([]))
    );
  }
}