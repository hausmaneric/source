import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FaceAuthService {
  private apiUrl = 'http://localhost:5000/compare';  // URL do backend Flask

  constructor(private http: HttpClient) { }

  // Enviar a imagem capturada para o backend Python
  compareFace(capturedImage: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { captured_image: capturedImage };

    return this.http.post<any>(this.apiUrl, body, { headers });
  }
}
