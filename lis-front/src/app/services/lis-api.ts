import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; // o ajusta el path
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LisApi {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  //Endpoints
  obtenerViajes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}Viaje/ObtenerViajes`);
  }
}
