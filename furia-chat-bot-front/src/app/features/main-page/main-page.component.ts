// main-page.component.ts
import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChatService } from '../../services/chat.service';
import { Match } from '../../models/match';
import { FutureMatch } from '../../models/future-match';
import { firstValueFrom } from 'rxjs';

interface ChatMessage {
  text: string;
  isBot: boolean;
  icon: string;
  isMatch?: boolean; // Nova propriedade para identificar mensagens de partida
  matches?: Match[]; // Array de partidas quando for o caso
}

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {
  @ViewChild('inputChat') inputChatRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('cardBody') cardBodyRef!: ElementRef<HTMLDivElement>;

  messages: ChatMessage[] = [
    {
      text: `Fala, guerreiro(a)! Aqui é o contato inteligente da FURIA!
  
  Digite um dos números abaixo para receber informações:
  
  1️⃣ - Próxima partida agendada
  2️⃣ - Últimas 3 Partidas da FURIA
  3️⃣ - Classificação atual no campeonato
  4️⃣ - Jogadores do elenco principal
  5️⃣ - Notícias recentes do time
  
  Qualquer outro número: Menu de opções`,
      isBot: true,
      icon: 'fa-robot'
    }

  ];

  constructor(private chatService: ChatService) { }

  // main-page.component.ts
  async manageChat() {
    if (this.inputChatRef?.nativeElement) {
      const message = this.inputChatRef.nativeElement.value.trim();

      if (!message) return;

      this.addMessage(message, false, 'fa-user');
      this.inputChatRef.nativeElement.value = '';

      try {
        const thinkingMsg = this.addMessage('Digitando...', true, 'fa-robot');

        // Atualizado para usar firstValueFrom
        const response = await firstValueFrom(this.chatService.sendMessage(message));

        this.messages = this.messages.filter(msg => msg !== thinkingMsg);

        if (response?.resposta) {
          if (this.isFutureMatch(response.resposta[0])) {
            const formattedResponse = this.formatFutureMatches(response.resposta);
            this.addMessage(formattedResponse, true, 'fa-robot');
          } else {
            const formattedResponse = this.formatPastMatches(response.resposta);
            this.addMessage(formattedResponse, true, 'fa-robot');
          }
        } else {
          this.addMessage('Não consegui obter informações sobre as partidas.', true, 'fa-robot');
        }

      } catch (error) {
        this.addMessage('Desculpe, ocorreu um erro ao processar sua mensagem.', true, 'fa-robot');
        console.error('Erro na API:', error);
      }
    }
  }

  private isFutureMatch(match: any): match is FutureMatch {
    return match && match.winnerName === '';
  }

  private formatPastMatches(matches: Match[]): string {
    return matches.map(match => {
      return `
    🏆 ${match.leagueName} - ${match.seriesName}
    ⚔️ ${match.matchName}
    📅 ${new Date(match.matchDate).toLocaleDateString('pt-BR')}
    🏆 Resultado: ${match.result}
    🎉 Vencedor: ${match.winnerName}
    📺 <a href="${match.streamUrl}" target="_blank" class="stream-link">Ver Transmissão</a>
      `;
    }).join('\n\n');
  }

  private formatFutureMatches(matches: FutureMatch[]): string {
    return matches.map(match => {
      const matchDate = new Date(match.matchDate);
      const formattedDate = matchDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
      🏟️ ${match.leagueName} - ${match.seriesName}
      ⚔️<strong>${match.teams[0].name}</strong> vs <strong>${match.teams[1].name}</strong>
      📅 ${formattedDate}
      📺 <a href="${match.streamUrl}" target="_blank" class="stream-link">Ver Transmissão</a>
      `;
    }).join('\n\n');
  }


  private addMessage(text: string, isBot: boolean, icon: string): ChatMessage {
    const newMsg = { text, isBot, icon };
    this.messages.push(newMsg);
    this.scrollToBottom();
    return newMsg;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.cardBodyRef.nativeElement.scrollTop = this.cardBodyRef.nativeElement.scrollHeight;
    }, 100);
  }
}