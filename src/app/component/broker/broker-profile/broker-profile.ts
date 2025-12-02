import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-broker-profile',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './broker-profile.html',
  styleUrls: ['./broker-profile.css']
})
export class BrokerProfile {

  // -------- Actual Profile Data --------
  name: string = "John Broker";
  email: string = "john.broker@tradewise.com";
  role: string = "Broker";
  memberSince: string = "Jan 2023";
  profileImg: string = "https://i.pravatar.cc/150?img=12";

  // Backup copy for Cancel option
  backupData: any = {};

  // Edit Mode Flag
  editMode: boolean = false;

  // ------------------ Enable Edit ------------------
  startEdit() {
    this.backupData = {
      name: this.name,
      email: this.email,
      memberSince: this.memberSince,
      profileImg: this.profileImg
    };

    this.editMode = true;
  }

  // ------------------ Cancel Edit ------------------
  cancelEdit() {
    this.name = this.backupData.name;
    this.email = this.backupData.email;
    this.memberSince = this.backupData.memberSince;
    this.profileImg = this.backupData.profileImg;

    this.editMode = false;
  }

  // ------------------ Save Changes ------------------
  saveChanges() {
    this.editMode = false;
  }

  // ------------------ Change Profile Photo ------------------
  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.profileImg = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
