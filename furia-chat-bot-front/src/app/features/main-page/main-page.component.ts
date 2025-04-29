// main-page.component.ts
import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChatService } from '../../services/chat.service';
import { Partida } from '../../models/partida';

interface ChatMessage {
  text: string;
  isBot: boolean;
  icon: string;
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
      text: 'Fala, guerreiro(a)! Aqui é o contato inteligente da FURIA!',
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

      // Adiciona mensagem do usuário
      this.addMessage(message, false, 'fa-user');
      this.inputChatRef.nativeElement.value = '';

      try {
        // Mostra mensagem de "digitando..."
        const thinkingMsg = this.addMessage('Digitando...', true, 'fa-robot');

        // Chama a API
        const response = await this.chatService.sendMessage(message).toPromise();

        // Remove "digitando..." e adiciona resposta real
        this.messages = this.messages.filter(msg => msg !== thinkingMsg);

        // Formata a resposta para exibição
        if (response?.resposta) {
          const formattedResponse = this.formatMatches(response.resposta);
          this.addMessage(formattedResponse, true, 'fa-robot');
        } else {
          this.addMessage('Não consegui obter informações sobre as partidas.', true, 'fa-robot');
        }

      } catch (error) {
        this.addMessage('Desculpe, ocorreu um erro ao processar sua mensagem.', true, 'fa-robot');
        console.error('Erro na API:', error);
      }
    }
  }

  private formatMatches(matches: Partida[]): string {
    return matches.map(match => {
      return `
      🏆 ${match.leagueName} - ${match.seriesName}
      ⚔️ ${match.matchName}
      📅 ${new Date(match.matchDate).toLocaleDateString()}
      🏆 Resultado: ${match.result}
      🎉 Vencedor: ${match.winnerName}
      📺 Assistir: ${match.streamUrl}
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