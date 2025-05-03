// services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Match } from '../models/match';
import { Player } from '../models/player';

interface ApiResponse {
  resposta: Match[]; // Usando o nome correto da propriedade
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) { }

  sendMessage(mensagem: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, { mensagem });
  }

  // No seu ChatService do Angular
  getProximasPartidas(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.apiUrl}/partidas/proximas`);
  }

  getUltimasPartidas(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.apiUrl}/partidas/ultimas`)
  }

  getJogadores(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.apiUrl}/jogadores`);
  }

  subscribeToNextMatchEmail(email: string) {
    return this.http.post(`${this.apiUrl}/notificacoes/proxima-partida`, { email });
  }
}