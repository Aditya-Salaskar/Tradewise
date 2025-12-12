import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { DashboardService } from '../../../services/dashboard.service';
import { User } from '../../../models/user.model';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, of, tap } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfile implements OnInit {
  isEditing = false;
  showPasswordSection = false;
  user$!: Observable<User>;
  user!: User;

  // Fields for visual display
  calculatedRiskLabel: string = 'Calculating...';
  calculatedRiskClass: string = 'risk-low';

  newPassword = '';
  confirmPassword = '';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.user$ = this.auth.getUserById(userId).pipe(
      switchMap(user => {
        const userData = {
          fullName: '', phone: '', accountNumber: '', panNumber: '',
          bankAccount: '', ifscCode: '', riskProfile: null, profilePicture: null,
          ...user
        };

        if (user.role === 'investor') {
          return this.dashboardService.getPortfolioSummary(userId).pipe(
            map(summary => {
              // ✅ CALL SHARED LOGIC
              // This fetches the actual portfolio value calculated in DashboardService
              this.calculateInvestorRisk(summary.portfolioValue);
              return userData;
            })
          );
        } else {
          return of(userData);
        }
      }),
      tap(u => this.user = u)
    );
  }

  calculateInvestorRisk(portfolioValueStr: string | number) {
    const value = this.dashboardService.parseMoney(portfolioValueStr);

    // ✅ USE SHARED LOGIC
    // We assume the default limit (2.5M) for now, or you could fetch limits if available
    const riskStatus = this.dashboardService.calculateRiskStatus(value);

    this.calculatedRiskLabel = riskStatus.label;
    this.calculatedRiskClass = riskStatus.cssClass;

    if (this.user) {
      this.user.riskProfile = this.calculatedRiskLabel;
    }
  }

  // --- Standard Profile Methods ---
  enableEdit() { this.isEditing = true; }

  cancelEdit() {
    this.isEditing = false;
    this.loadUserData();
  }

  saveProfile() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.auth.updateUser(userId, this.user).subscribe({
      next: () => {
        alert('Profile updated successfully!');
        this.isEditing = false;
        this.loadUserData();
      },
      error: () => alert('Update failed.')
    });
  }

  togglePasswordSection() { this.showPasswordSection = !this.showPasswordSection; }

  updatePassword() {
    if (!this.newPassword || this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match or are empty!');
      return;
    }
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const updated = { ...this.user, password: this.newPassword };
    this.auth.updateUser(userId, updated).subscribe({
      next: () => {
        alert('Password updated successfully');
        this.showPasswordSection = false;
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: () => alert('Password update failed')
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.user.profilePicture = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
