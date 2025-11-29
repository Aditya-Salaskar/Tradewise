import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-broker-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './broker-layout.html',
  styleUrls: ['./broker-layout.css']
})
export class BrokerLayout {

  toggleTheme(event: any) {
    const enabled = event.target.checked;

    if (enabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

}
