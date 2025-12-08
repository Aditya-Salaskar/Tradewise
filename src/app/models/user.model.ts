export interface User {
  id?: string;
  username: string;
  email: string;
  password?: string;
  role: 'investor' | 'broker' | 'admin';
  fullName?: string;
  phone?: string;
  riskProfile?: 'aggressive' | 'moderate' | 'conservative' | string | null;
  profilePicture?: string | null;
}