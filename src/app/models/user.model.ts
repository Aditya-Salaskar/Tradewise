export interface User {
  id?: string;
  username: string;
  email: string;
  password: string;
  role: 'investor' | 'broker' | 'admin';
  fullName?: string;
  phone?: string;
  accountNumber?: string;
  ifscCode?: string;
  riskProfile?: 'aggressive' | 'moderate' | 'conservative' | null;
  profilePicture?: string;
}