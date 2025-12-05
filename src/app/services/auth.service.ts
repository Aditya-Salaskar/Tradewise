import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  login(username:string, password:string): Observable<User[]> {
    const params = new HttpParams()
      .set('username', username)
      .set('password', password);
    return this.http.get<User[]>(this.apiUrl, { params });

  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  } 

  setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
  }

  getRole(): 'broker' | 'investor' | 'admin' | null {
    const user = this.getCurrentUser();
    return user?.role ?? null;
  }
}
