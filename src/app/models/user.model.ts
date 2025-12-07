export interface User {
  id?: string;
  username: string;
  email: string;
  password?: string;
  role: 'investor' | 'broker' | 'admin';
  
  // Optional fields used in Profile
  fullName?: string;
  phone?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankAccount?: string;
  
  // ✅ ADDED: Missing property causing the error
  panNumber?: string; 
  
  // ✅ UPDATED: Allow null to fix type mismatch errors
  riskProfile?: 'aggressive' | 'moderate' | 'conservative' | string | null;
  profilePicture?: string | null;
}