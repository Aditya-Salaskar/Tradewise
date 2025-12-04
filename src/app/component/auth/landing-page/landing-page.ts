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
  styleUrls: ['./landing-page.css'],
})
export class LandingPage {
  constructor(private router: Router, private authService: AuthService) {}
  
  isRegisterMode = false;
  showAuthModal = false;

  openAuthModal() {
    this.showAuthModal = true;
  }

  closeAuthModal() {
    this.showAuthModal = false;
  }


loginData = { username: '', password: '' };
registerData = { username: '', email: '', password: '', role: '' };

toggleMode() {
  this.isRegisterMode = !this.isRegisterMode;
}

onLogin() {
  const { username, password } = this.loginData;

  if (!username || !password) {
      alert('Please enter both username and password.');
      return;
    }

  this.authService.login(username, password).subscribe({
    next: (users) => {
      if (!Array.isArray(users) || users.length === 0) {
        alert('Invalid credentials');
        return;
        }

      const user = users[0];
      const role = user.role 

      this.authService.setCurrentUser(user);
      localStorage.setItem('userId', String(user.id));
      localStorage.setItem('role', role);
      localStorage.setItem('username', user.username);
      
      const targetUrl = `/${role}/dashboard`;

      console.log('[Login] user:', user);
      console.log('[Login] navigating to:', targetUrl);
      console.log('[Login] router.config paths:', this.router.config.map(r => r.path));

      this.router.navigateByUrl(targetUrl)
        .then(() => {
          alert('Login successful');
          this.closeAuthModal();
        })
        .catch(err => {
          console.error('Navigation failed:', err);
          alert('Navigation failed. Check routes and casing.');
        });

  },
  error: (err) => {
        console.error('Login error:', err);
        alert('Login failed. Please try again.');
      },
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

  
this.authService.register(newUser).subscribe({
      next: () => {
        alert('Registration successful! Please log in.');
        this.toggleMode(); // switch to login form
      },
      error: (err) => {
               console.error('Registration error:', err);
        alert('Registration failed. Please try again.');
      },
    });
  }
}
