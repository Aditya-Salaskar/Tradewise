import { Routes } from '@angular/router';

// Broker Components
import { BrokerDashboard } from './component/broker/broker-dashboard/broker-dashboard';
import { BrokerLayout } from './component/broker/broker-layout/broker-layout';
import { BrokerProfile } from './component/broker/broker-profile/broker-profile';
import { BrokerLogout } from './component/broker/broker-logout/broker-logout';

// Auth
import { LandingPage } from './component/auth/landing-page/landing-page';

// Investor Components
import { InvestorLayout } from './component/investor/investor-layout/investor-layout';
import { InvestorDashboard } from './component/investor/investor-dashboard/investor-dashboard';
import { InvestorPortfolio } from './component/investor/investor-portfolio/investor-portfolio';
import { MarketList } from './component/market/market-list/market-list';
import { InstrumentDetails } from './component/market/instrument-detail/instrument-detail';
import { InvestorLogout } from './component/investor/investor-logout/investor-logout';
import { InvestorProfile } from './component/investor/investor-profile/investor-profile';

// NEW: Investor Orders component
import { InvestorOrder } from './component/investor/investor-order/investor-order';

// Risk Analysis
import { RiskAnalysis } from './component/investor/riskAnalysis/risk-analysis';
import { InvestorTrade } from './component/investor/investor-trade/investor-trade';

export const routes: Routes = [
  { path: '', component: LandingPage },

  {
    path: 'broker',
    component: BrokerLayout,
    children: [
      { path: 'dashboard', component: BrokerDashboard },
      { path: 'market', component: MarketList },
      { path: 'market/:symbol', component: InstrumentDetails },
      { path: 'risk-analysis', component: RiskAnalysis },
      { path: 'profile', component: BrokerProfile },
      { path: 'logout', component: BrokerLogout }
    ]
  },

  {
    path: 'investor',
    component: InvestorLayout,
    children: [
      { path: 'dashboard', component: InvestorDashboard },
      { path: 'portfolio', component: InvestorPortfolio },

      // ADDED: orders route for investor -> investor-order component
      { path: 'orders', component: InvestorOrder },
      { path: 'trade', component: InvestorTrade },

      // existing market/profile/logout routes
      { path: 'market', component: MarketList },
      { path: 'market/:symbol', component: InstrumentDetails },
      { path: 'profile', component: InvestorProfile },
      { path: 'logout', component: InvestorLogout }
    ]
  },

  { path: 'risk-analysis', component: RiskAnalysis }
];
