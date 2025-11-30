import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-investor-nav',
   standalone: true,
  imports: [RouterModule],
  templateUrl: './investor-nav.html',
  styleUrl: './investor-nav.css',
})
export class InvestorNav {

  toggleTheme(event: any) {
    const enabled = event.target.checked;

    if (enabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}

