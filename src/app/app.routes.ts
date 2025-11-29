import { Routes } from '@angular/router';

// Broker Components
import { BrokerOrderList } from './component/broker/broker-order-list/broker-order-list';
import { BrokerLayout } from './component/broker/broker-layout/broker-layout';
import { BrokerProfile } from './component/broker/broker-profile/broker-profile';
import { BrokerLogout } from './component/broker/broker-logout/broker-logout';

// Auth
import { LandingPage } from './component/auth/landing-page/landing-page';

// Investor
import { InvestorDashboard } from './component/investor/investor-dashboard/investor-dashboard';
import { InvestorPortfolio } from './component/investor/investor-portfolio/investor-portfolio';

// Risk Analysis
import { RiskAnalysis } from './component/investor/riskAnalysis/risk-analysis';

export const routes: Routes = [

  { path: '', component: LandingPage },

  {
    path: 'broker',
    component: BrokerLayout,
    children: [
      { path: 'dashboard', component: BrokerOrderList },
      { path: 'orders', component: BrokerOrderList },
      { path: 'risk-analysis', component: RiskAnalysis },
      { path: 'profile', component: BrokerProfile },
      { path: 'logout', component: BrokerLogout }
    ]
  },

  { path: 'investor', component: InvestorDashboard },
  { path: 'portfolio', component: InvestorPortfolio },

  { path: 'risk-analysis', component: RiskAnalysis }
];
