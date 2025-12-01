
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-investor-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './investor-layout.html',
  styleUrls: ['./investor-layout.css']
})
export class InvestorLayout {
 toggleTheme(event: any) {
    const enabled = event.target.checked;

    if (enabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}
