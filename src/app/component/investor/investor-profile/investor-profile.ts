
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-investor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './investor-profile.html',
  styleUrls: ['./investor-profile.css']
})
export class InvestorProfile {
  isEditing = false;
  showPasswordSection = false;

  user = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 9876543210',
    username: 'john_doe',
    role: 'INVESTOR',
    accountNumber: 'ACC-123456789',
    panNumber: 'ABCDE1234F',
    bankAccount: '1234567890',
    ifscCode: 'HDFC0001234',
    profilePicture: 'assets/default-avatar.png' // Default image
  };

  newPassword = '';
  confirmPassword = '';

  enableEdit() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveProfile() {
    console.log('Profile updated:', this.user);
    this.isEditing = false;
    // TODO: API call to save changes
  }

  togglePasswordSection() {
    this.showPasswordSection = !this.showPasswordSection;
  }

  updatePassword() {
    if (this.newPassword === this.confirmPassword) {
      console.log('Password updated successfully');
      this.showPasswordSection = false;
      this.newPassword = '';
      this.confirmPassword = '';
    } else {
      alert('Passwords do not match!');
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.user.profilePicture = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
