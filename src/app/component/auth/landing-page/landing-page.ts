import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  constructor(private router: Router, private authService: AuthService) {}
  
  showAuthModal = false;

  openAuthModal() {
    this.showAuthModal = true;
  }

  closeAuthModal() {
    this.showAuthModal = false;
  }

  isRegisterMode = false;

loginData = { username: '', password: '' };
registerData = { username: '', email: '', password: '', role: '' };

toggleMode() {
  this.isRegisterMode = !this.isRegisterMode;
}

onLogin() {
  
if (!this.loginData.username || !this.loginData.password) {
    alert('Please enter both username and password.');
    return;
  }

  this.authService.login(this.loginData.username, this.loginData.password).subscribe((users) => {
    if (users.length > 0){
      alert('Login successfull');
      const user = users[0];
      const role = users[0].role;
      if(role === 'INVESTOR'){
        localStorage.setItem('userId', String(user.id));
        this.router.navigate(['/investor/dashboard']);
      } else if(role === 'BROKER'){
        this.router.navigate(['broker/dashboard']);
      } else if(role === 'ADMIN'){
        this.router.navigate(['admin/dashboard']);
      }
    } else {
      alert('Invalid credentials');
    }
  });
}

onRegister() {
  
const newUser = {
    ...this.registerData,
    fullName: '',
    phone: '',
    accountNumber: '',
    panNumber: '',
    bankAccount: '',
    ifscCode: '',
    profilePicture: ''
  };

  this.authService.register(newUser).subscribe(()=>{
    alert('Registration successful! Please log in.');
    this.toggleMode();
  });
}
}
