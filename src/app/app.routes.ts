
import { Routes } from '@angular/router';

import { BrokerOrderList } from './component/broker/broker-order-list/broker-order-list';
//import { BrokerOrderDetailComponent } from './broker-order-detail/broker-order-detail';
import { LandingPage } from './component/auth/landing-page/landing-page';
import { InvestorDashboard } from './component/investor/investor-dashboard/investor-dashboard';
import { InvestorPortfolio } from './component/investor/investor-portfolio/investor-portfolio';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'broker/orders', component: BrokerOrderList },
  //{ path: 'broker/orders/:id', component: BrokerOrderDetailComponent }
  { path: 'investor', component: InvestorDashboard },
  { path: 'portfolio', component: InvestorPortfolio },

];
