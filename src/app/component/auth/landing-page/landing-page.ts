import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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

  // Models
  loginData = { username: '', password: '' };
  registerData = { username: '', email: '', password: '', role: '' };

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    // Clear forms when switching
    this.loginData = { username: '', password: '' };
    this.registerData = { username: '', email: '', password: '', role: '' };
  }

  // --- LOGIN LOGIC ---
  onLogin(form: NgForm) {
    if (form.invalid) return; // Stop if somehow bypassed

    const { username, password } = this.loginData;

    this.authService.login(username, password).subscribe({
      next: (users) => {
        // json-server returns an array. Check if user exists.
        if (Array.isArray(users) && users.length > 0) {
          const user = users[0];

          this.authService.setCurrentUser(user);
          localStorage.setItem('userId', String(user.id)); // Important for other pages

          // Route based on role
          const targetUrl = user.role === 'broker' ? '/broker/dashboard' : '/investor/dashboard';
          this.router.navigate([targetUrl]);
        } else {
          alert('Invalid credentials. Please check your username or password.');
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        alert('Server error. Please try again later.');
      },
    });
  }

  // --- REGISTER LOGIC ---
  onRegister(form: NgForm) {
    if (form.invalid) {
      // Mark all fields as touched to show errors if user force-submits (e.g. hitting enter)
      Object.keys(form.controls).forEach(field => {
        const control = form.control.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
      return;
    }

    const newUser = {
      ...this.registerData,
      fullName: this.registerData.username, // Default full name
      profilePicture: 'https://i.pravatar.cc/150?img=12', // Default Avatar
      // Initialize empty financial fields to prevent null errors later
      phone: '',
      accountNumber: '',
      panNumber: '',
      bankAccount: '',
      ifscCode: ''
    };

    this.authService.register(newUser).subscribe({
      next: () => {
        alert('Registration successful! Please log in.');
        this.toggleMode(); // Switch back to login
      },
      error: (err) => {
        console.error('Registration error:', err);
        alert('Registration failed. Please try again.');
      },
    });
  }
}
