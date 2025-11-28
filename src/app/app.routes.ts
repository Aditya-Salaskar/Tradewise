import { Routes } from '@angular/router';
import { LandingPage } from './auth/landing-page/landing-page';
import { InvestorDashboard } from './investor/investor-dashboard/investor-dashboard';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'investor-dashboard', component: InvestorDashboard }
];