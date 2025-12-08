import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { DashboardService } from '../../../services/dashboard.service'; // ✅ Added
import { User } from '../../../models/user.model';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, of } from 'rxjs';

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
  
  // ✅ Calculated Fields for Investor
  calculatedRiskLabel: string = 'Calculating...';
  calculatedRiskClass: string = 'risk-low';
  
  newPassword = '';
  confirmPassword = '';

  constructor(
    private http: HttpClient, 
    private auth: AuthService,
    private dashboardService: DashboardService // ✅ Inject Service
  ) {}

  ngOnInit() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    this.user$ = this.auth.getUserById(userId).pipe(
      switchMap(user => {
        // Basic User Data
        const userData = {
          fullName: '',
          phone: '',
          accountNumber: '',
          panNumber: '',
          bankAccount: '',
          ifscCode: '',
          riskProfile: null, // We will override this for investors
          profilePicture: null,
          ...user
        };

        // ✅ LOGIC: If Investor, Calculate Risk based on Portfolio Value
        if (user.role === 'investor') {
          return this.dashboardService.getPortfolioSummary(userId).pipe(
            map(summary => {
              this.calculateInvestorRisk(summary.portfolioValue);
              return userData;
            })
          );
        } else {
          return of(userData);
        }
      })
    );

    this.user$.subscribe(u => this.user = u);
  }

  // ✅ New Logic: Matches Risk Analysis Calculation
  calculateInvestorRisk(portfolioValueStr: string | number) {
    // 1. Clean value
    const value = Number(String(portfolioValueStr).replace(/[^\d.-]/g, '')) || 0;
    
    // 2. Define Limit (Same as Risk Page default)
    const exposureLimit = 2500000; 

    // 3. Calculate Utilization
    const utilization = (value / exposureLimit) * 100;

    // 4. Determine Profile
    if (utilization < 40) {
      this.calculatedRiskLabel = 'Conservative (Low Risk)';
      this.calculatedRiskClass = 'risk-low';
    } else if (utilization < 80) {
      this.calculatedRiskLabel = 'Moderate (Medium Risk)';
      this.calculatedRiskClass = 'risk-moderate';
    } else {
      this.calculatedRiskLabel = 'Aggressive (High Risk)';
      this.calculatedRiskClass = 'risk-aggressive';
    }
    
    // Update user object for display if needed
    if (this.user) {
      this.user.riskProfile = this.calculatedRiskLabel;
    }
  }

  enableEdit() { this.isEditing = true; }
  cancelEdit() { this.isEditing = false; } 

  saveProfile() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    this.auth.updateUser(userId, this.user).subscribe({
      next: () => {
        alert('Profile updated');
        this.isEditing = false;
      },
      error: () => alert('Update failed')
    });
  }

  togglePasswordSection() { this.showPasswordSection = !this.showPasswordSection; }

  updatePassword() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    const updated = { ...this.user, password: this.newPassword };
    this.auth.updateUser(userId, updated).subscribe({
      next: () => {
        alert('Password updated');
        this.showPasswordSection = false;
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: () => alert('Update failed')
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