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
  obtenerOperadores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}Viaje/ObtenerOperadores`);
  }
  obtenerPaises(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}Viaje/ObtenerPaises`);
  }
  obtenerEstados(paisId:any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}Viaje/ObtenerEstados/${paisId}`);
  }  
  obtenerMunicipios(estadoId:any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}Viaje/ObtenerMunicipios/${estadoId}`);
  }
  insertarViaje(viaje: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}Viaje/InsertarViaje`, viaje);
  }
}
