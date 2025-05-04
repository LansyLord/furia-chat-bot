// services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Match } from '../models/match';
import { Player } from '../models/player';
import { environment } from '../../enviroments/enviroment.prod';

interface ApiResponse {
  resposta: Match[]; // Usando o nome correto da propriedade
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  sendMessage(mensagem: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, { mensagem });
  }

  // No seu ChatService do Angular
  getProximasPartidas(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.apiUrl}api/v1/partidas/proximas`);
  }

  getUltimasPartidas(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.apiUrl}api/v1/partidas/ultimas`)
  }

  getJogadores(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.apiUrl}api/v1/jogadores`);
  }

  subscribeToNextMatchEmail(email: string) {
    return this.http.post(`${this.apiUrl}api/v1/notificacoes/proxima-partida`, { email });
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}api/v1/check-email?email=${encodeURIComponent(email)}`);
  }
}