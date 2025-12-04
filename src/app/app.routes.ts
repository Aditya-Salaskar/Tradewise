import { Routes } from '@angular/router';

// Auth
import { LandingPage } from './component/auth/landing-page/landing-page';

//Shared Components
import { Sidebar } from './component/shared/sidebar/sidebar';
import { MarketList } from './component/market/market-list/market-list';
import { InstrumentDetails } from './component/market/instrument-detail/instrument-detail';
import { UserProfile } from './component/shared/profile/user-profile';

// Broker Components
import { BrokerDashboard } from './component/broker/broker-dashboard/broker-dashboard';
import { RiskAnalysis } from './component/broker/riskAnalysis/risk-analysis';

// Investor Components
import { InvestorDashboard } from './component/investor/investor-dashboard/investor-dashboard';
import { InvestorPortfolio } from './component/investor/investor-portfolio/investor-portfolio';
import { InvestorOrder } from './component/investor/investor-order/investor-order';
import { InvestorTrade } from './component/investor/investor-trade/investor-trade';

import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: LandingPage },

  {
    path: 'broker',
    component: Sidebar,
    canActivate: [RoleGuard],
    children: [
      { path: 'dashboard', component: BrokerDashboard },
      { path: 'market', component: MarketList },
      { path: 'market/:symbol', component: InstrumentDetails },
      { path: 'risk-analysis', component: RiskAnalysis },
      { path: 'profile', component: UserProfile },
    ]
  },

  {
    path: 'investor',
    component: Sidebar,
    canActivate: [RoleGuard],
    children: [
      { path: 'dashboard', component: InvestorDashboard },
      { path: 'portfolio', component: InvestorPortfolio },
      { path: 'orders', component: InvestorOrder },
      { path: 'trade', component: InvestorTrade },

      // existing market/profile/logout routes
      { path: 'market', component: MarketList },
      { path: 'market/:symbol', component: InstrumentDetails },
      { path: 'profile', component: UserProfile },

    ]
  },

];
