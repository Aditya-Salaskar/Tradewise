
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-investor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './investor-profile.html',
  styleUrls: ['./investor-profile.css']
})
export class InvestorProfile implements OnInit {
  isEditing = false;
  showPasswordSection = false;
  user: User | any = {};
  newPassword = '';
  confirmPassword = '';

  constructor(private http: HttpClient,private auth: AuthService) {}

  ngOnInit() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('No user session found. Please log in.');
      return;
    }
    
this.auth.getUserById(userId).subscribe({
      next: (data) => {
        this.user = {
          fullName: '',
          phone: '',
          accountNumber: '',
          panNumber: '',
          bankAccount: '',
          ifscCode: '',
          profilePicture: 'assets/default-avatar.png', // safe default
          ...data
        };
      },
      error: () => {
        alert('Could not load user profile. Is json-server running?');
      }
    });
}

  enableEdit() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveProfile() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    this.auth.updateUser(userId, this.user).subscribe({
      next: () => {
        alert('Profile updated');
        this.isEditing = false;
      },
      error: () => {
        alert('Update failed');
      }
    });

  }

  togglePasswordSection() {
    this.showPasswordSection = !this.showPasswordSection;
  }

  updatePassword() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const updated = { ...this.user, password: this.newPassword };

    this.auth.updateUser(userId, updated).subscribe({
      next: () => {
        alert('Password updated successfully');
        this.showPasswordSection = false;
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: () => {
        alert('Password update failed');
      }
    });
  }


  
onFileSelected(event: any) {
    const file = event.target.files?.[0];
       if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.user.profilePicture = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}

