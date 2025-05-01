import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChatService } from '../../services/chat.service';
import { Match } from '../../models/match';
import { FutureMatch } from '../../models/future-match';
import { Player } from '../../models/player'; // Importe a interface Player
import { firstValueFrom } from 'rxjs';

interface ChatMessage {
  text: string;
  isBot: boolean;
  icon: string;
  isMatch?: boolean;
  matches?: Match[];
  isPlayerList?: boolean; // Para identificar lista de jogadores
  players?: Player[]; // Array de jogadores
  isPlayerDetailPrompt?: boolean; // Para identificar prompt de detalhes
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

  private currentPlayers: Player[] = []; // Armazena os jogadores atualmente listados
  private awaitingPlayerSelection: boolean = false; // Flag para controle de estado

  constructor(private chatService: ChatService) { }

  async manageChat() {
    if (!this.inputChatRef?.nativeElement) return;

    const message = this.inputChatRef.nativeElement.value.trim();
    this.inputChatRef.nativeElement.value = '';

    if (!message) return;

    // Adiciona mensagem do usuário
    this.addMessage(message, false, 'fa-user');

    try {
      // Se estamos aguardando seleção de jogador
      if (this.awaitingPlayerSelection) {
        this.handlePlayerSelection(message);
        return;
      }

      const thinkingMsg = this.addMessage('Digitando...', true, 'fa-robot');

      let response: any;

      switch (message) {
        case '1': // Próxima partida
          const proximaPartida = await firstValueFrom(this.chatService.getProximasPartidas());
          response = { resposta: proximaPartida };
          break;

        case '2': // Últimas partidas
          const ultimasPartidas = await firstValueFrom(this.chatService.getUltimasPartidas());
          response = { resposta: ultimasPartidas };
          break;

        case '3':
          const jogadores = await firstValueFrom(this.chatService.getJogadores());
          response = { resposta: jogadores };
          break;

        default:
          this.addMessage('Opção inválida. Digite 1, 2 ou 3.', true, 'fa-robot');
          return;
      }

      // Remove mensagem "Digitando..."
      this.messages = this.messages.filter(msg => msg !== thinkingMsg);

      // Processa a resposta
      if (response?.resposta) {
        if (message === '1') {
          const formattedResponse = this.formatFutureMatches(response.resposta);
          this.addMessage(formattedResponse, true, 'fa-robot');
        }
        else if (message === '2') {
          const formattedResponse = this.formatPastMatches(response.resposta);
          this.addMessage(formattedResponse, true, 'fa-robot');
        }
        else if (message === '3') {
          this.currentPlayers = response.resposta;
          const formattedResponse = this.formatPlayers(response.resposta);
          this.addMessage(formattedResponse, true, 'fa-robot', true);

          // Pergunta se quer ver detalhes
          this.addPlayerDetailPrompt();
        }
      }

    } catch (error) {
      this.addMessage('Desculpe, ocorreu um erro ao processar sua mensagem.', true, 'fa-robot');
      console.error('Erro na API:', error);
    }
  }

  private handlePlayerSelection(selection: string) {
    const selectedNumber = parseInt(selection);

    if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > this.currentPlayers.length) {
      this.addMessage('Opção inválida. Por favor, digite um número correspondente a um jogador.', true, 'fa-robot');
      this.addPlayerDetailPrompt(); // Mostra o prompt novamente
      return;
    }

    const selectedPlayer = this.currentPlayers[selectedNumber - 1];
    this.showPlayerDetails(selectedPlayer);
    this.awaitingPlayerSelection = false;
  }

  private addPlayerDetailPrompt() {
    this.awaitingPlayerSelection = true;
    this.addMessage(
      `Deseja ver detalhes sobre algum jogador? Digite o número correspondente (1 a ${this.currentPlayers.length}):`,
      true,
      'fa-robot',
      false,
      undefined,
      true
    );
  }

  private showPlayerDetails(player: Player) {
    const birthday = player.birthday ? new Date(player.birthday).toLocaleDateString('pt-BR') : 'Não informado';
    const age = player.age ? `${player.age} anos` : 'Não informado';

    const details = `
      🎮 ${player.nickname}
      👤 Nome completo: ${player.fullName || player.firstName + ' ' + player.lastName}
      🏳️ Nacionalidade: ${player.nationality || 'Não informada'}
      🎂 Data de nascimento: ${birthday}
      📅 Idade: ${age}
      ${player.imageUrl ? `<img src="${player.imageUrl}" alt="${player.nickname}" class="player-image">` : ''}
    `;

    this.addMessage(details, true, 'fa-robot');
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

  private formatPlayers(players: Player[]): string {
    return `👥 Elenco Principal da FURIA:\n\n` +
      players.map((player, index) =>
        `${index + 1}️⃣ ${player.nickname || player.firstName} ${player.firstName ? `(${player.firstName} ${player.lastName})` : ''}`
      ).join('\n');
  }

  private addMessage(
    text: string,
    isBot: boolean,
    icon: string,
    isPlayerList: boolean = false,
    players: Player[] = [],
    isPlayerDetailPrompt: boolean = false
  ): ChatMessage {
    const newMsg = {
      text,
      isBot,
      icon,
      isPlayerList,
      players,
      isPlayerDetailPrompt
    };
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