import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  login(username:string, password:string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}?username=${username}&password=${password}`);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  } 
}


export interface User {
  id?: string;
  username: string;
  email: string;
  password: string;
  role: 'INVESTOR' | 'BROKER' | 'ADMIN' | string;
  fullName?: string;
  phone?: string;
  accountNumber?: string;
  panNumber?: string;
  bankAccount?: string;
  ifscCode?: string;
  profilePicture?: string;
}
