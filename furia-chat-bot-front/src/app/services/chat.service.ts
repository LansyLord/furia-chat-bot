// services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partida } from '../models/partida';

interface ApiResponse {
  resposta: Partida[]; // Usando o nome correto da propriedade
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8080/api/chat/mensagem';

  constructor(private http: HttpClient) { }

  sendMessage(mensagem: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, { mensagem });
  }
}