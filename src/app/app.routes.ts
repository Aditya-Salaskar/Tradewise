import { Routes } from '@angular/router';
import { LandingPage } from './component/auth/landing-page/landing-page';
import { InvestorDashboard } from './component/investor/investor-dashboard/investor-dashboard';
import { InvestorPortfolio } from './component/investor/investor-portfolio/investor-portfolio';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'investor', component: InvestorDashboard },
  { path: 'portfolio', component: InvestorPortfolio },
];